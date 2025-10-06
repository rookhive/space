import { ChatWithFreshMessages } from './ChatWithFreshMessages';

type Props = {
  onChatMessageSend: () => void;
};

export function VideoRoomHUD(props: Props) {
  return (
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute bottom-5 left-5 w-full">
        <ChatWithFreshMessages onMessageSend={props.onChatMessageSend} />
      </div>
    </div>
  );
}
