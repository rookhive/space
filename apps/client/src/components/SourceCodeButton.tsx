import { Icon } from '@repo/ui/icon';
import clsx from 'clsx';
import { Show } from 'solid-js';
import { env } from '~/env/client';

type Props = {
  withDescription?: boolean;
};

export function SourceCodeButton(props: Props) {
  const isOpenSource = Boolean(env.VITE_REPOSITORY_URL);

  return (
    <Show when={isOpenSource}>
      <a
        class={clsx(
          'glass-panel flex items-center gap-1 rounded-full! duration-200 ease-out *:transition-opacity hover:bg-white/10!',
          props.withDescription ? 'px-1' : 'h-12.5 w-12.5 items-center justify-center'
        )}
        href={env.VITE_REPOSITORY_URL}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Show when={!props.withDescription}>
          <Icon id="github-logo" />
        </Show>
        <Show when={props.withDescription}>
          <div class="flex h-11.5 w-11.5 items-center justify-center">
            <Icon id="github-logo" class="h-7.5 w-7.5" />
          </div>
          <span class="mr-3 text-sm">Source code</span>
        </Show>
      </a>
    </Show>
  );
}
