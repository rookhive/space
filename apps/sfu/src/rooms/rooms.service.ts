import { Injectable } from '@nestjs/common';
import { RoomID, RouterID, UserID } from '@repo/typesystem';
import { Room } from './entities/Room';
import { User } from './entities/User';

@Injectable()
export class RoomsService {
  readonly #rooms = new Map<RoomID, Room>();
  readonly #users = new Map<UserID, User>();

  getRoomById(roomId: RoomID) {
    return this.#rooms.get(roomId);
  }

  getUserById(userId: UserID) {
    return this.#users.get(userId);
  }

  async createRoom(roomId: RoomID, routerId: RouterID) {
    const room = new Room(roomId, routerId);
    this.#rooms.set(roomId, room);
  }

  deleteRoom(roomId: RoomID) {
    const room = this.#rooms.get(roomId);
    if (room) {
      room.users.forEach((user) => this.deleteUserFromRoom(user.id, roomId));
      this.#rooms.delete(roomId);
    }
  }

  addUserToRoom(userId: UserID, roomId: RoomID) {
    const room = this.#rooms.get(roomId);
    if (room) {
      const user = new User(userId, room.id);
      room.addUser(user);
      this.#users.set(userId, user);
    }
  }

  deleteUserFromRoom(userId: UserID, roomId: RoomID) {
    const room = this.#rooms.get(roomId);
    if (room) {
      room.removeUser(userId);
      this.#users.delete(userId);
    }
  }
}
