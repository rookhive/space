import { Icon } from '@repo/ui/icon';

export function NotSupportedDeviceMessage() {
  return (
    <div class="gradient-background flex grow flex-col items-center justify-center gap-2 p-2">
      <Icon class="h-[50px] w-[50px] text-amber-600" id="warning" />
      <span class="w-[200px] text-center font-thin">
        Mobile and touch devices are not supported
      </span>
    </div>
  );
}
