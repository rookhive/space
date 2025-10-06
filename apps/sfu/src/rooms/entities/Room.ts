import { ProducerID, RoomID, RouterID, UserID } from '@repo/typesystem';
import type { User } from './User';

export class Room {
  readonly #id: RoomID;
  readonly #routerId: RouterID;
  readonly #users = new Map<UserID, User>();

  constructor(id: RoomID, routerId: RouterID) {
    this.#id = id;
    this.#routerId = routerId;
  }

  get id() {
    return this.#id;
  }

  get routerId() {
    return this.#routerId;
  }

  get users() {
    return this.#users.values();
  }

  addUser(user: User) {
    this.#users.set(user.id, user);
  }

  removeUser(userId: UserID) {
    this.#users.delete(userId);
  }

  getProducersForUser(userId: UserID) {
    return this.#users
      .values()
      .reduce<{ userId: UserID; producerId: ProducerID }[]>((producers, user) => {
        if (user.id !== userId) {
          producers.push(
            ...user.producerIds.map((producerId) => ({
              userId: user.id,
              producerId,
            }))
          );
        }
        return producers;
      }, []);
  }
}
