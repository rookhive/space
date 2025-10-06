import { clsx } from 'clsx';
import { For } from 'solid-js';
import { colors, preferencesStore } from '~/stores/preferences-store';

export function ColorPicker() {
  const [preferences, setPreferences] = preferencesStore;

  const selectedColor = () => preferences.color;

  return (
    <div class="glass-panel-surface flex items-center overflow-hidden rounded-full">
      <For each={colors}>
        {(color) => {
          const isSelected = () => selectedColor() === color;
          return (
            <button
              type="button"
              class={clsx(
                'cursor-pointer border-transparent border-b-2 border-solid p-2 pt-2.5 outline-0 transition-all duration-300 ease-in-out',
                isSelected() && 'cursor-default bg-white/5!'
              )}
              onMouseDown={() => setPreferences({ color })}
            >
              <span
                class={clsx(
                  'block h-[24px] w-[24px] rounded-full shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out',
                  isSelected() && 'scale-115'
                )}
                style={{
                  'background-color': `#${color.toString(16).padStart(6, '0')}`,
                }}
              />
            </button>
          );
        }}
      </For>
    </div>
  );
}
