import iconsPath from '../icons/icons.svg?url';

export type Props = {
  id:
    | 'github-logo'
    | 'octagon'
    | 'microphone'
    | 'camera'
    | 'warning'
    | 'down'
    | 'left'
    | 'right'
    | 'start'
    | 'in'
    | 'out'
    | 'add'
    | 'send'
    | 'fullscreen'
    | 'fullscreen-exit'
    | 'copy'
    | 'done';
  class?: string;
};

export function Icon(props: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" class={props.class} width={32} height={32}>
      <use href={`${iconsPath}#${props.id}`} fill="currentColor" />
    </svg>
  );
}
