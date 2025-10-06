import { createPermission } from '@solid-primitives/permission';
import { createEffect, on } from 'solid-js';

export function useDevice(
  device: 'camera' | 'microphone',
  onPermissionChange: (isPermissionGranted: boolean) => void
) {
  const permission = createPermission(device);
  const isPermissionGranted = () => permission() === 'granted';
  createEffect(on(isPermissionGranted, onPermissionChange));
}
