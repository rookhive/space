import { Avatar } from '@repo/ui/avatar';
import clsx from 'clsx';
import type { Message } from '~/stores/room-store';

type Props = {
  message: Message;
  isFirstMessage: boolean;
};

export function ChatMessage(props: Props) {
  const { type, message, timestamp } = props.message;
  const [time] = new Date(timestamp).toTimeString().split(' ');

  const renderedTime = (
    <span class="mt-[5px] translate-x-[0px] self-start whitespace-nowrap font-thin text-xs opacity-70">
      {time}
    </span>
  );

  if (type === 'system') {
    return (
      <div class={clsx('gap-2', props.isFirstMessage && 'mt-auto')}>
        <span class="mx-2 font-thin text-sm italic">{message}</span>
        {renderedTime}
      </div>
    );
  }

  const { userName, userColor, userAvatarUrl } = props.message;

  return (
    <div class={clsx('my-[1px] flex min-w-0 gap-2 px-2', props.isFirstMessage && 'mt-auto')}>
      <div class="flex items-center gap-[6px] self-start">
        <Avatar size="s" color={userColor} name={userName} url={userAvatarUrl} />
        <span style={{ color: userColor }}>{userName}</span>
      </div>
      <div class="min-w-0 shrink break-words">{message}</div>
      {renderedTime}
    </div>
  );
}
