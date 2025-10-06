import { clsx } from 'clsx';
import { Icon, type Props as IconProps } from './Icon';

type Props = {
  iconId: IconProps['id'];
  isMuted: boolean;
  isDisabled?: boolean;
  onToggle?: (isMuted: boolean) => void;
};

export function MuteButton(props: Props) {
  return (
    <button
      type="button"
      class={clsx(
        'after:-translate-x-1/2 after:-translate-y-1/2 relative inline-flex h-[50px] w-[50px] cursor-pointer items-center justify-center duration-300 after:absolute after:top-1/2 after:left-1/2 after:h-[3px] after:w-0 after:origin-center after:rotate-45 after:rounded-xs after:bg-current after:shadow after:transition-all after:content-[""]',
        props.isMuted && 'after:w-[calc(80%)]',
        props.isDisabled && 'cursor-default'
      )}
      onClick={() => !props.isDisabled && props.onToggle?.(!props.isMuted)}
    >
      <Icon
        id={props.iconId}
        class={clsx('transition-all duration-300', props.isMuted && 'scale-80 opacity-80')}
      />
    </button>
  );
}
