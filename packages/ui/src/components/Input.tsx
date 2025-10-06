import clsx from 'clsx';
import { createEffect, createSignal } from 'solid-js';
import { Button } from './Button';
import type { Props as IconProps } from './Icon';

type Props = {
  value?: string;
  placeholder?: string;
  iconId?: IconProps['id'];
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  onValidate?: (value: string) => boolean;
};

export function Input(props: Props) {
  const [isFocused, setIsFocused] = createSignal(false);
  const [innerValue, setInnerValue] = createSignal(props.value ?? '');

  let inputRef!: HTMLInputElement;

  function Placeholder() {
    return (
      <div
        class={clsx(
          'pointer-events-none absolute top-0 bottom-0 left-4 flex items-center transition-all duration-200 ease-out',
          props.value?.length ? 'translate-x-2 opacity-0' : 'translate-x-0'
        )}
      >
        {props.placeholder ?? 'Enter message..'}
      </div>
    );
  }

  createEffect(() => {
    const value = props.value ?? '';
    if (value !== innerValue()) setInnerValue(value);
  });

  createEffect(() => {
    if (props.autoFocus) {
      inputRef.focus();
    }
  });

  return (
    <form
      class="group glass-panel relative flex w-full items-center overflow-hidden"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit?.(props.value ?? '');
      }}
    >
      <input
        ref={inputRef}
        class="w-auto min-w-0 grow self-stretch border-0 px-4 outline-none transition-all duration-200 ease-out hover:bg-white/2.5! focus:bg-white/2.5!"
        value={props.value}
        onInput={(e) => {
          e.preventDefault();
          const { value } = e.currentTarget as HTMLInputElement;
          if (!props.onValidate || props.onValidate(value)) {
            props.onChange(value);
          } else {
            queueMicrotask(() => {
              if (inputRef && inputRef.value !== innerValue()) {
                inputRef.value = innerValue();
              }
            });
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <Placeholder />
      <Button
        type="submit"
        iconId={props.iconId || 'send'}
        noStyle
        class={clsx(
          'relative z-2 w-[50px] shrink-0 rounded-l-none shadow-lg duration-200 ease-out group-hover:bg-white/2.5!',
          isFocused() && 'bg-white/2.5'
        )}
      />
    </form>
  );
}
