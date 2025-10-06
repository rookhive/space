import { type Vector3, World } from '@dimforge/rapier3d';
import { PHYSICS_TIMESTEP, VIDEO_ROOM_GRAVITY } from '@repo/constants';
import type { UserID, UserInput } from '@repo/typesystem';
import { CollisionManager } from '../lib/CollisionManager';
import type { RoomPhysics } from '../types';
import { UserPhysics } from './UserPhysics';

export class VideoRoomPhysics implements RoomPhysics {
  readonly #world: World;
  readonly #users = new Map<UserID, UserPhysics>();

  constructor() {
    this.#world = new World({ x: 0.0, y: VIDEO_ROOM_GRAVITY, z: 0.0 });
    this.#world.timestep = PHYSICS_TIMESTEP;
    new CollisionManager(this.#world).addCollisions();
  }

  step() {
    this.#users.values().forEach((user) => user.step());
    this.#world.step();
  }

  dispose() {
    this.#users.values().forEach((user) => user.dispose());
    this.#users.clear();
    this.#world.free();
  }

  addUser(userId: UserID) {
    const position = this.#generateSpawnPosition();
    this.#users.set(userId, new UserPhysics(userId, this.#world, position));
  }

  getUser(userId: UserID) {
    return this.#users.get(userId);
  }

  removeUser(userId: UserID) {
    const user = this.#users.get(userId);
    if (!user) return;
    user.dispose();
    this.#users.delete(userId);
  }

  getAllUsers() {
    return Array.from(this.#users.values());
  }

  applyUserInput(userId: UserID, input: UserInput) {
    this.#users.get(userId)?.applyInput(input);
  }

  #generateSpawnPosition(): Vector3 {
    const radius = 10;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * radius;
    return {
      x: distance * Math.cos(angle),
      y: 10,
      z: distance * Math.sin(angle),
    };
  }
}
