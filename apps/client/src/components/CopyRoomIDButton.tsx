import { Button } from '@repo/ui/button';
import { Icon } from '@repo/ui/icon';
import { useParams } from '@solidjs/router';
import { createSignal, onCleanup, onMount, Show } from 'solid-js';
import { Motion, Presence } from 'solid-motionone';

export function CopyRoomIDButton() {
  const params = useParams();
  const [isCopied, setIsCopied] = createSignal(false);
  const [initialOpacity, setInitialOpacity] = createSignal(1);

  let mountTimeoutId: NodeJS.Timeout;
  let copyTimeoutId: NodeJS.Timeout;

  onMount(() => {
    mountTimeoutId = setTimeout(() => setInitialOpacity(0.2), 100);
  });

  onCleanup(() => {
    clearTimeout(mountTimeoutId);
    clearTimeout(copyTimeoutId);
  });

  function handleRoomIDCopy() {
    if (isCopied()) return;
    navigator.clipboard.writeText(params.roomId).then(() => {
      setIsCopied(true);
      copyTimeoutId = setTimeout(() => setIsCopied(false), 2000);
    });
  }

  return (
    <Button onClick={handleRoomIDCopy}>
      <Presence exitBeforeEnter>
        <Show
          when={isCopied()}
          fallback={
            <Motion.div
              class="flex items-center justify-center gap-2"
              initial={{ opacity: initialOpacity() }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Icon id="copy" />
              <span>Copy room ID</span>
            </Motion.div>
          }
        >
          <Motion.div
            class="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <span class="text-green-600">
              <Icon id="done" />
            </span>
            <span>Copied</span>
          </Motion.div>
        </Show>
      </Presence>
    </Button>
  );
}
