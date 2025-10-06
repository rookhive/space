import { CHAT_HUD_MESSAGE_COUNT, CHAT_HUD_MESSAGE_DURATION } from '@repo/constants';
import { Input } from '@repo/ui/input';
import clsx from 'clsx';
import { createSignal, For, onCleanup, onMount } from 'solid-js';
import { type Message, roomStore } from '~/stores/room-store';
import { ChatMessage } from './ChatMessage';

type Props = {
  onMessageSend: () => void;
};

export function ChatWithFreshMessages(props: Props) {
  let tickTimeoutId: NodeJS.Timeout;

  const [tick, setTick] = createSignal(0);

  onMount(() => {
    tickTimeoutId = setInterval(() => {
      setTick((tick) => tick + 1);
    }, 1000);
  });

  onCleanup(() => {
    clearInterval(tickTimeoutId);
  });

  function checkIfMessageFresh(message: Message) {
    tick(); // Force rerender the list of messages on each tick
    return Date.now() - message.timestamp < CHAT_HUD_MESSAGE_DURATION;
  }

  const freshMessages = () => {
    return roomStore.state.messages.slice(-CHAT_HUD_MESSAGE_COUNT).filter(checkIfMessageFresh);
  };

  const staleMessagesCount = () => {
    return roomStore.state.messages.length - freshMessages().length;
  };

  return (
    <div class="flex min-h-0 w-full min-w-0 max-w-[800px] grow flex-col">
      <div class="flex grow flex-col overflow-hidden pb-3">
        {staleMessagesCount() > 0 && (
          <div
            class={clsx(
              "before:mr-2 before:ml-[8px] before:inline-block before:h-[8px] before:w-[8px] before:rounded-full before:bg-[var(--color-brand-light)] before:content-['']",
              freshMessages().length > 0 && 'my-2'
            )}
          >
            <span class="font-thin text-sm">
              {staleMessagesCount()} message{staleMessagesCount() > 1 ? 's' : ''} in history
            </span>
          </div>
        )}
        <For each={freshMessages()}>
          {(chatMessage, i) => <ChatMessage message={chatMessage} isFirstMessage={i() === 0} />}
        </For>
      </div>
      {roomStore.state.isHUDChatInputOpen && (
        <div class="shrink-0">
          <Input
            autoFocus
            value={roomStore.state.chatMessage}
            onChange={roomStore.setChatMessage}
            onSubmit={props.onMessageSend}
          />
        </div>
      )}
    </div>
  );
}
