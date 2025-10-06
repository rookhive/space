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
          'glass-panel flex items-center gap-1 rounded-full! duration-200 ease-out hover:bg-white/10! [&>*]:transition-opacity',
          props.withDescription ? 'px-1' : 'h-[50px] w-[50px] items-center justify-center'
        )}
        href={env.VITE_REPOSITORY_URL}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Show when={!props.withDescription}>
          <Icon id="github-logo" />
        </Show>
        <Show when={props.withDescription}>
          <div class="flex h-[46px] w-[46px] items-center justify-center">
            <Icon id="github-logo" class="h-[30px] w-[30px]" />
          </div>
          <span class="mr-3 text-sm">Source code</span>
        </Show>
      </a>
    </Show>
  );
}
