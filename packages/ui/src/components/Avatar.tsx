import clsx from 'clsx';
import { createSignal, mergeProps, onMount } from 'solid-js';

type Props = {
  size: 's' | 'm';
  url: string;
  name: string;
  color: string;
};

export function Avatar(initialProps: Props) {
  const props = mergeProps({ size: 'm' }, initialProps);
  const [isLoaded, setIsLoaded] = createSignal(false);
  const [isError, setIsError] = createSignal(false);

  let avatarRef!: HTMLImageElement;

  onMount(() => {
    avatarRef.onload = () => setIsLoaded(true);
    avatarRef.onerror = () => setIsError(true);
  });

  return (
    <div
      class={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-white/15 transition-opacity duration-300',
        props.size === 's' ? 'h-[19px] w-[19px] outline-2' : 'h-[32px] w-[32px] outline-3'
      )}
      style={{ 'outline-color': props.color }}
    >
      <img
        ref={avatarRef}
        src={props.url}
        alt={props.name}
        class="h-full w-full rounded-full object-cover"
        style={{ opacity: isLoaded() && !isError() ? 1 : 0 }}
      />
    </div>
  );
}
