import { deviceStore } from '~/stores/device-store';
import { DeviceToggleButton } from './DeviceToggleButton';

export function DeviceToggleButtons() {
  return (
    <div class="pointer-events-auto mb-auto flex w-full max-w-full flex-col gap-3">
      <DeviceToggleButton
        deviceType="camera"
        deviceName={deviceStore.state.cameraName}
        isEnabled={deviceStore.state.isCameraEnabled}
        isPermissionGranted={deviceStore.state.isCameraPermissionGranted}
        onToggle={deviceStore.setIsCameraEnabled}
      />
      <DeviceToggleButton
        deviceType="microphone"
        deviceName={deviceStore.state.microphoneName}
        isEnabled={deviceStore.state.isMicrophoneEnabled}
        isPermissionGranted={deviceStore.state.isMicrophonePermissionGranted}
        onToggle={deviceStore.setIsMicrophoneEnabled}
      />
    </div>
  );
}
