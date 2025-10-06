import { Input } from '@repo/ui/input';
import { createEffect, For, onMount } from 'solid-js';
import { roomStore } from '~/stores/room-store';
import { ChatMessage } from './ChatMessage';

type Props = {
  onMessageSend: () => void;
};

export function Chat(props: Props) {
  let chatContainer!: HTMLDivElement;
  let isScrolledToBottom = true;

  onMount(() => {
    chatContainer.scrollTo({
      behavior: 'instant',
      top: chatContainer.scrollHeight,
    });
  });

  createEffect(() => {
    roomStore.state.messages.length;
    if (isScrolledToBottom) {
      chatContainer.scrollTo({
        behavior: 'smooth',
        top: chatContainer.scrollHeight,
      });
    }
  });

  function handleChatScroll() {
    const offsetThreshold = 10;
    const { scrollHeight, scrollTop, clientHeight } = chatContainer;
    isScrolledToBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < offsetThreshold;
  }

  return (
    <div class="flex min-h-0 min-w-0 max-w-[800px] grow flex-col">
      <div
        ref={chatContainer}
        class="flex grow flex-col overflow-x-hidden overflow-y-scroll pb-3"
        style={{ 'scrollbar-width': 'none' }}
        onScroll={handleChatScroll}
      >
        <For each={roomStore.state.messages}>
          {(chatMessage, i) => <ChatMessage message={chatMessage} isFirstMessage={i() === 0} />}
        </For>
      </div>
      <div class="shrink-0">
        <Input
          value={roomStore.state.chatMessage}
          onChange={roomStore.setChatMessage}
          onSubmit={props.onMessageSend}
        />
      </div>
    </div>
  );
}
