import { Icon } from '@repo/ui/icon';

export function NotSupportedDeviceMessage() {
  return (
    <div class="gradient-background flex grow flex-col items-center justify-center gap-2 p-2">
      <Icon class="h-12.5 w-12.5 text-white" id="warning" />
      <span class="w-50 text-center font-thin">Mobile and touch devices are not supported</span>
    </div>
  );
}
