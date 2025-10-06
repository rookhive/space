import { Button } from '@repo/ui/button';
import { Chat } from './Chat';
import { CopyRoomIDButton } from './CopyRoomIDButton';
import { DeviceToggleButtons } from './DeviceToggleButtons';
import { UsersOnline } from './UsersOnline';

type Props = {
  onLeave: () => void;
  onResume: () => void;
  onChatMessageSend: () => void;
};

export function VideoRoomOverlay(props: Props) {
  return (
    <div class="absolute inset-0 flex p-5 pt-[82px] backdrop-blur-lg">
      <div class="absolute top-0 right-0 left-[150px] flex h-[82px] items-center">
        <UsersOnline />
      </div>
      <div class="flex min-w-0 grow">
        <Chat onMessageSend={props.onChatMessageSend} />
      </div>
      <div class="ml-4 flex w-[300px] shrink-0 flex-col items-center space-y-4">
        <DeviceToggleButtons />
        <div class="mt-auto flex w-full flex-col gap-3">
          <CopyRoomIDButton />
          <Button iconId="out" iconPosition="start" variant="regular" onClick={props.onLeave}>
            Leave room
          </Button>
          <Button variant="pulse" iconId="right" iconPosition="end" onClick={props.onResume}>
            Resume
          </Button>
        </div>
      </div>
    </div>
  );
}
