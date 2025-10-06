import type { Vector3 } from '@dimforge/rapier3d';
import type { UserID, UserInput } from '@repo/typesystem';
import type { UserPhysics } from './physics/UserPhysics';

export interface RoomPhysics {
  step(deltaTime?: number): void;
  addUser(userId: UserID, position?: Vector3): void;
  getUser(userId: UserID): UserPhysics | undefined;
  removeUser(userId: UserID): void;
  getAllUsers(): UserPhysics[];
  applyUserInput(userId: UserID, input: UserInput): void;
}
