import { MuteButton } from '@repo/ui/mute-button';
import clsx from 'clsx';
import { Show } from 'solid-js';
import { roomStore } from '~/stores/room-store';
import { VideoTrackPreview } from './VideoTrackPreview';

type Props = {
  deviceType: 'camera' | 'microphone';
  deviceName: string;
  isEnabled: boolean;
  isPermissionGranted: boolean;
  onToggle: (isEnabled: boolean) => void;
};

export function DeviceToggleButton(props: Props) {
  const isDeviceMuted = () => !props.isPermissionGranted || !props.isEnabled;

  function handleToggle() {
    if (!props.isPermissionGranted) return;
    props.onToggle(!props.isEnabled);
  }

  return (
    <div class="glass-panel flex flex-col overflow-hidden">
      {props.deviceType === 'camera' && (
        <div class={clsx('relative h-0 w-full pb-[calc(1080/1920*100%)]')}>
          <div class="absolute inset-0 flex items-center justify-center bg-white/5">
            <VideoTrackPreview track={roomStore.state.localVideoTrack} />
          </div>
        </div>
      )}
      <div
        class={clsx(
          'relative flex cursor-pointer items-center py-1',
          props.isPermissionGranted ? 'cursor-pointer!' : 'cursor-default!'
        )}
        onClick={handleToggle}
      >
        <div class="shrink-0">
          <MuteButton isDisabled iconId={props.deviceType} isMuted={isDeviceMuted()} />
        </div>
        <div class="flex min-w-0 flex-col pr-4">
          <Show
            when={props.isPermissionGranted}
            fallback={<span class="text-amber-500 text-sm">No permission granted</span>}
          >
            <span class="truncate text-sm">{props.deviceName}</span>
          </Show>
          <span
            class={clsx(
              'truncate font-thin text-sm',
              isDeviceMuted() ? 'text-white' : 'font-normal! text-green-600'
            )}
          >
            <span class="inline-block first-letter:capitalize">{props.deviceType}</span> is{' '}
            {isDeviceMuted() ? 'off' : 'on'}
          </span>
        </div>
      </div>
    </div>
  );
}
