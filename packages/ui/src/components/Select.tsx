import { clsx } from 'clsx';
import { createEffect, createSignal, For, type JSX, onCleanup, onMount } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Motion, Presence } from 'solid-motionone';
import { Icon } from './Icon';

type Item<ID, T> = {
  id: ID;
  value: T;
};

export type Props<ID, T> = {
  items: Item<ID, T>[];
  selectedId: ID;
  onChange: (selectedItem: Item<ID, T>) => void;
};

export function Select<ID extends string, T extends string | number | null | undefined>(
  props: Props<ID, T>
) {
  let anchorRef: HTMLButtonElement | null = null;
  let dropdownRef: HTMLUListElement | null = null;

  const [isOpen, setIsOpen] = createSignal(false);
  const [dropdownStyle, setDropdownStyle] = createSignal<JSX.CSSProperties>({});

  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });

  createEffect(() => {
    if (isOpen() && anchorRef && dropdownRef) {
      const { top, right } = anchorRef.getBoundingClientRect();
      const offset = 10;
      setDropdownStyle({
        bottom: `${window.innerHeight - top + offset}px`,
        right: `${window.innerWidth - right}px`,
        maxHeight: `${top - offset * 2}px`,
      });
    }
  });

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (anchorRef && dropdownRef && !anchorRef.contains(target) && !dropdownRef.contains(target)) {
      setIsOpen(false);
    }
  }

  function selectedItem() {
    return props.items.find(({ id }) => id === props.selectedId);
  }

  return (
    <div class="relative h-full w-full">
      <button
        type="button"
        class="flex h-full w-full cursor-pointer items-center"
        ref={(node) => (anchorRef = node)}
        onClick={() => setIsOpen((isOpen) => !isOpen)}
      >
        <span class="grow truncate">{selectedItem()?.value}</span>
        <Icon
          class={clsx(
            'w-[50px] shrink-0 origin-center transition-transform duration-300 ease-in-out',
            isOpen() && 'rotate-180'
          )}
          id="down"
        />
      </button>

      <Portal>
        <Presence exitBeforeEnter>
          {isOpen() && (
            <Motion.ul
              ref={(node) => (dropdownRef = node)}
              class="glass-panel fixed max-w-[400px] overflow-y-auto py-3"
              style={dropdownStyle()}
              initial={{ opacity: 0, transform: 'translateY(-20px)' }}
              animate={{ opacity: 1, transform: 'translateY(0)' }}
              exit={{ opacity: 0, transform: 'translateY(0px) scale(0.95)' }}
              transition={{ duration: 0.3 }}
            >
              <For each={props.items}>
                {(item) => {
                  const isSelected = () => item.id === props.selectedId;
                  return (
                    <li
                      class={clsx(
                        'relative select-none before:pointer-events-none before:absolute before:top-[6px] before:bottom-[6px] before:left-[6px] before:w-[4px] before:rounded-xs before:transition-all before:duration-200 before:content-[""]',
                        isSelected() && 'before:bg-[var(--color-brand)]!'
                      )}
                    >
                      <button
                        type="button"
                        class={clsx(
                          'w-full cursor-pointer overflow-hidden px-5 py-2 text-left hover:bg-white/5',
                          isSelected() && 'cursor-default! bg-white/5'
                        )}
                        onClick={() => {
                          props.onChange(item);
                          setIsOpen(false);
                        }}
                      >
                        <span class="block truncate">{item.value}</span>
                      </button>
                    </li>
                  );
                }}
              </For>
            </Motion.ul>
          )}
        </Presence>
      </Portal>
    </div>
  );
}
