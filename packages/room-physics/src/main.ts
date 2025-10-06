export type { RoomPhysics } from './types';

export default async function () {
  await import('@dimforge/rapier3d');
  return await import('./physics/VideoRoomPhysics');
}
