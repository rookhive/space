import { clsx } from 'clsx';
import { type JSX, mergeProps } from 'solid-js';
import { Motion, Presence } from 'solid-motionone';
import { Icon, type Props as IconProps } from './Icon';
import { Spinner } from './Spinner';

export type Props = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  iconId?: IconProps['id'];
  iconPosition?: 'start' | 'end';
  variant?: 'regular' | 'pulse';
  noStyle?: boolean;
  isLoading?: boolean;
};

export function Button(initialProps: Props) {
  const props = mergeProps(
    {
      variant: 'regular',
      noStyle: false,
      isLoading: false,
      iconPosition: 'start' as const,
    },
    initialProps
  );

  return (
    <button
      {...props}
      class={clsx(
        'h-[50px] rounded-2xl',
        props.class,
        'relative',
        props.isLoading && 'pointer-events-none'
      )}
    >
      {props.variant === 'pulse' && (
        <span class="-translate-1/2 absolute top-1/2 left-1/2 z-1 h-full w-full animate-pulse rounded-[inherit] bg-[var(--color-brand)]" />
      )}
      <div
        class={clsx(
          'relative z-2 flex h-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[inherit] px-5 py-3 text-white outline-0 transition-all duration-200 ease-out hover:bg-white/10! [&>*]:transition-opacity [&>*]:duration-200',
          !props.noStyle && 'glass-panel-surface',
          props.isLoading && 'cursor-default! [&>*]:opacity-0'
        )}
      >
        {props.iconId && (
          <Icon
            id={props.iconId}
            class={clsx('shrink-0', props.iconPosition === 'start' ? 'order-0' : 'order-2')}
          />
        )}
        {props.children && (
          <div class={clsx(props.iconId && (props.iconPosition === 'start' ? 'mr-3' : 'ml-3'))}>
            {props.children}
          </div>
        )}
      </div>
      <Presence>
        {props.isLoading && (
          <Motion.div
            class="absolute inset-0 z-2 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Spinner />
          </Motion.div>
        )}
      </Presence>
    </button>
  );
}
