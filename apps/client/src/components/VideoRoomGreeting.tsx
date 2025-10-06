import { Button } from '@repo/ui/button';
import clsx from 'clsx';
import { For } from 'solid-js';

type Key = string;

type Props = {
  onClose: () => void;
};

export function VideoRoomGreeting(props: Props) {
  const activeKeys: Record<Key, string> = {
    esc: 'Open/close overlay',
    w: 'Move forward',
    a: 'Move left',
    s: 'Move backward',
    d: 'Move right',
    c: 'Move down',
    shift: 'Accelerate',
    space: 'Fly up',
    enter: 'Open quick chat',
  };

  const keyboardRows: Key[][] = [
    ['esc', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'],
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
    ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['caps lock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'right shift'],
    ['ctrl', 'meta', 'alt', 'space', 'right alt', 'meta', 'menu', 'right ctrl'],
  ];

  const widthMap: Record<Key, number> = {
    tab: 1.5,
    'caps lock': 1.75,
    enter: 2.25,
    alt: 1.35,
    ctrl: 1.35,
    shift: 2.25,
    meta: 1.35,
    menu: 1.35,
    space: 6,
    'right alt': 1.35,
    'right ctrl': 1.35,
    'right shift': 2.75,
    backspace: 2,
    '\\': 1.5,
  };

  const offsetMap: Record<Key, number> = {
    esc: 2,
    f4: 1,
    f8: 1,
  };

  return (
    <div class="flex select-none flex-col gap-5">
      <h1 class="text-4xl">You are connected!</h1>
      <div class="font-thin text-md">Quick reminder of the controls:</div>
      <div class="flex gap-5">
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-1 self-start rounded-2xl bg-black/30 p-5">
            <For each={keyboardRows}>
              {(row, rowIndex) => (
                <div class={clsx('flex justify-between gap-1', rowIndex() === 0 && 'py-2')}>
                  <For each={row}>
                    {(key) => {
                      const offset = offsetMap[key] || 0;
                      const width = widthMap[key] || 1;
                      const isActive = key in activeKeys;
                      return (
                        <div
                          class={clsx(
                            'inline-flex h-10 w-1 shrink-0 grow items-center justify-center rounded-lg border uppercase',
                            isActive
                              ? 'border-green-600/80 bg-green-600/30 text-white'
                              : 'border-white/30'
                          )}
                          style={{
                            'margin-right': `${offset * 1.25}rem`,
                            width: `${width * 2.5}rem`, // Tailwind's w-10 is 2.5rem by default
                          }}
                        >
                          {isActive && <span class="text-xs">{key}</span>}
                        </div>
                      );
                    }}
                  </For>
                </div>
              )}
            </For>
          </div>
          <Button class="w-[300px] self-start" variant="pulse" onClick={props.onClose}>
            Got it!
          </Button>
        </div>
        <div class="flex flex-col gap-1">
          <For each={Object.entries(activeKeys)}>
            {([key, description]) => {
              const width = `${widthMap[key] ? (key === 'space' ? '5.5rem' : '3.5rem') : '2.25rem'}`;
              return (
                <div class="flex items-center gap-2.5 text-sm">
                  <div
                    class="inline-flex h-9 w-9 shrink-0 grow-0 items-center justify-center rounded-lg border border-green-600/80 bg-green-600/30 text-white text-xs uppercase"
                    style={{ width }}
                  >
                    {key}
                  </div>
                  -<span class="grow">{description}</span>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
}
