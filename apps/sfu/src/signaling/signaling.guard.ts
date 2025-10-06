import { Code, ConnectError, createContextKey, HandlerContext } from '@connectrpc/connect';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_COOKIE_NAME } from '@repo/constants';
import type { UserData } from '@repo/typesystem';
import { parse as parseCookie } from 'cookie';
import type { Room } from '../rooms/entities/Room';
import type { User } from '../rooms/entities/User';
import { RoomsService } from '../rooms/rooms.service';

export const USER_CONTEXT_KEY = createContextKey(
  {} as {
    user: User;
    room: Room;
  }
);

@Injectable()
export class SignalingGuard {
  constructor(
    private readonly jwtService: JwtService,
    private readonly roomsService: RoomsService
  ) {}

  guardAndGetUser(context: HandlerContext) {
    const userData = this.#verifyToken(context);
    const user = this.roomsService.getUserById(userData.id);
    if (!user) throw new ConnectError('User not found', Code.NotFound);
    const room = this.roomsService.getRoomById(user.roomId);
    if (!room) throw new ConnectError('Room not found', Code.NotFound);
    return { user, room };
  }

  #verifyToken(context: HandlerContext) {
    try {
      const cookie = context.requestHeader.get('cookie');
      if (!cookie) throw Error;
      const accessToken = parseCookie(cookie)[ACCESS_TOKEN_COOKIE_NAME];
      if (!accessToken) throw Error;
      const payload = this.jwtService.verify<UserData>(accessToken, { algorithms: ['HS256'] });
      return payload;
    } catch {
      throw new ConnectError('Unauthenticated', Code.Unauthenticated);
    }
  }
}
