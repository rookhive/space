import { Button } from '@repo/ui/button';
import { createMediaPermissionRequest } from '@solid-primitives/stream';
import { A, useParams } from '@solidjs/router';
import { createEffect, on, onCleanup, onMount } from 'solid-js';
import { Motion } from 'solid-motionone';
import { DeviceController } from '~/core/DeviceController';
import { PreviewController } from '~/core/PreviewController';
import { useDevice } from '~/hooks/use-device';
import { deviceStore } from '~/stores/device-store';
import { preferencesStore } from '~/stores/preferences-store';
import type { RoomData } from '~/types';
import { ColorPicker } from './ColorPicker';
import { DeviceSelect } from './DeviceSelect';
import { RoomJoinButton } from './RoomJoinButton';

type Props = {
  onStart: (roomData: RoomData) => void;
};

export function PreviewScreen(props: Props) {
  let containerRef!: HTMLDivElement;
  let deviceController!: DeviceController;
  let previewController!: PreviewController;

  const params = useParams();
  const [preferences] = preferencesStore;
  const isRoomCreating = params.roomId === 'new';

  onMount(async () => {
    deviceController = new DeviceController();
    deviceController.setDevices({
      camera: deviceStore.state.camera,
      microphone: deviceStore.state.microphone,
    });
    previewController = new PreviewController(containerRef);
    previewController.startLoop();
    createMediaPermissionRequest();
  });

  onCleanup(() => {
    deviceController.dispose();
    previewController.dispose();
  });

  useDevice('camera', deviceStore.setIsCameraPermissionGranted);
  useDevice('microphone', deviceStore.setIsMicrophonePermissionGranted);

  createEffect(() => {
    deviceStore.state.isCameraPermissionGranted &&
    deviceStore.state.isCameraEnabled &&
    deviceStore.state.camera
      ? startVideoTrack()
      : stopVideoTrack();
  });

  createEffect(() => {
    deviceStore.state.isMicrophonePermissionGranted &&
    deviceStore.state.isMicrophoneEnabled &&
    deviceStore.state.microphone
      ? startAudioTrack()
      : stopAudioTrack();
  });

  createEffect(
    on(
      () => deviceStore.state.camera,
      async (cameraId) => {
        if (!cameraId) return;
        deviceController.setCamera(cameraId);
        await stopVideoTrack();
        if (deviceStore.state.isCameraEnabled) startVideoTrack();
      },
      { defer: true }
    )
  );

  createEffect(
    on(
      () => deviceStore.state.microphone,
      async (microphoneId) => {
        if (!microphoneId) return;
        deviceController.setMicrophone(microphoneId);
        await stopAudioTrack();
        if (deviceStore.state.isMicrophoneEnabled) startAudioTrack();
      },
      { defer: true }
    )
  );

  createEffect(() => {
    previewController.setUserColor(preferences.color);
  });

  async function startVideoTrack() {
    const videoTrack = await deviceController.startVideoTrack();
    videoTrack
      ? previewController.setVideoTrack(videoTrack)
      : deviceStore.setIsCameraEnabled(false);
  }

  async function startAudioTrack() {
    const audioTrack = await deviceController.startAudioTrack();
    audioTrack
      ? previewController.setAudioTrack(audioTrack)
      : deviceStore.setIsMicrophoneEnabled(false);
  }

  function stopVideoTrack() {
    deviceController.stopVideoTrack();
    previewController.deleteVideoTrack();
  }

  function stopAudioTrack() {
    deviceController.stopAudioTrack();
    previewController.deleteAudioTrack();
  }

  return (
    <Motion.div
      class="relative h-screen w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2 }}
    >
      <div class="absolute inset-0" ref={containerRef} />
      <div class="absolute bottom-5 left-5">
        <A href="/">
          <Button type="button" iconId="left">
            Back
          </Button>
        </A>
      </div>
      <div class="absolute right-5 bottom-5 left-5 flex flex-col items-center justify-center gap-5">
        <ColorPicker />
        <div class="flex items-center justify-center gap-5">
          <DeviceSelect
            iconId="camera"
            deviceType="camera"
            selectedDevice={deviceStore.state.camera}
            isPermissionGranted={deviceStore.state.isCameraPermissionGranted}
            onDeviceMute={(isMuted) => deviceStore.setIsCameraEnabled(!isMuted)}
            onDeviceSelect={({ id: deviceId, value: deviceName }) =>
              deviceStore.setState({ camera: deviceId, cameraName: deviceName })
            }
          />
          <DeviceSelect
            iconId="microphone"
            deviceType="microphone"
            selectedDevice={deviceStore.state.microphone}
            isPermissionGranted={deviceStore.state.isMicrophonePermissionGranted}
            onDeviceMute={(isMuted) => deviceStore.setIsMicrophoneEnabled(!isMuted)}
            onDeviceSelect={({ id: deviceId, value: deviceName }) =>
              deviceStore.setState({ microphone: deviceId, microphoneName: deviceName })
            }
          />
        </div>
      </div>
      <div class="absolute right-5 bottom-5">
        <RoomJoinButton
          isRoomCreating={isRoomCreating}
          onRoomCreated={(room) => props.onStart({ room })}
        />
      </div>
    </Motion.div>
  );
}
