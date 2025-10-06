import { Icon } from '@repo/ui/icon';
import { clsx } from 'clsx';
import { mergeProps } from 'solid-js';

type Props = {
  size?: 'regular' | 'large';
};

export function Logo(initialProps: Props) {
  const props = mergeProps({ size: 'regular' }, initialProps);
  const isLarge = props.size === 'large';

  return (
    <div class="ml-1 flex items-center gap-2">
      <Icon
        id="octagon"
        class={clsx(
          'text-[var(--color-brand)]',
          isLarge && 'h-[80px] w-[80px] drop-shadow-[0px_6px_8px_rgba(0,0,0,0.2)]'
        )}
      />
      <span
        class={clsx('font-bold font-heading uppercase', isLarge ? 'ml-1 text-7xl' : 'text-2xl')}
      >
        Space
      </span>
    </div>
  );
}
