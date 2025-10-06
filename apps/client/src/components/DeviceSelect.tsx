import { Icon, type Props as IconProps } from '@repo/ui/icon';
import { MuteButton } from '@repo/ui/mute-button';
import { Select } from '@repo/ui/select';
import { createCameras, createMicrophones } from '@solid-primitives/devices';
import { createEffect, Match, Show, Switch } from 'solid-js';
import { Motion, Presence } from 'solid-motionone';
import { deviceStore } from '~/stores/device-store';

type DeviceType = 'camera' | 'microphone';
type DeviceID = string;

type Props = {
  deviceType: DeviceType;
  selectedDevice: DeviceID;
  iconId: IconProps['id'];
  isPermissionGranted: boolean;
  onDeviceMute: (isMuted: boolean) => void;
  onDeviceSelect: (item: { id: DeviceID; value: string }) => void;
};

export function DeviceSelect(props: Props) {
  const isPermissionGranted = () => props.isPermissionGranted;
  const isMuted = () =>
    props.deviceType === 'camera'
      ? !deviceStore.state.isCameraEnabled
      : !deviceStore.state.isMicrophoneEnabled;

  return (
    <div class="glass-panel flex items-center">
      <div class="relative shrink-0">
        <Presence>
          <Show when={!isPermissionGranted()}>
            <Motion.div
              class="-top-1 absolute right-0.5 z-2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Icon id="warning" class="h-5 w-5 text-amber-500" />
            </Motion.div>
          </Show>
        </Presence>
        <MuteButton
          iconId={props.iconId}
          isMuted={isPermissionGranted() ? isMuted() : true}
          isDisabled={!isPermissionGranted()}
          onToggle={props.onDeviceMute}
        />
      </div>
      <div class="relative flex h-[50px] w-[190px] grow items-center self-stretch">
        <Presence exitBeforeEnter>
          <Switch
            fallback={
              <Motion.div
                class="absolute inset-0 flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DeviceSelectComponent
                  deviceType={props.deviceType}
                  selectedDevice={props.selectedDevice}
                  onSelect={props.onDeviceSelect}
                />
              </Motion.div>
            }
          >
            <Match when={!isPermissionGranted()}>
              <Motion.div
                class="cursor-default px-2 text-amber-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                Permission needed
              </Motion.div>
            </Match>
          </Switch>
        </Presence>
      </div>
    </div>
  );
}

type DeviceSelectComponentProps = {
  deviceType: DeviceType;
  selectedDevice: DeviceID;
  onSelect: (item: { id: DeviceID; value: string }) => void;
};

function DeviceSelectComponent(props: DeviceSelectComponentProps) {
  const devices = props.deviceType === 'camera' ? createCameras() : createMicrophones();
  const isDeviceAvailable = () => devices().length > 0;

  createEffect(() => {
    const device = devices().find((device) => device.deviceId === props.selectedDevice);
    if (isDeviceAvailable() && !device) {
      const defaultDevice = devices().find((device) => device.deviceId === 'default');
      const { deviceId, label } = defaultDevice ?? devices()[0];
      props.onSelect({ id: deviceId, value: label });
    }
  });

  return (
    <Show
      when={isDeviceAvailable()}
      fallback={<span class="text-left font-thin">No {props.deviceType} found</span>}
    >
      <Select
        selectedId={props.selectedDevice}
        items={devices().map((device) => ({ id: device.deviceId, value: device.label }))}
        onChange={props.onSelect}
      />
    </Show>
  );
}
