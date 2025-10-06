import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_COOKIE_NAME } from '@repo/constants';
import type { UserData } from '@repo/typesystem';
import { RoomsService } from 'src/rooms/rooms.service';

@Injectable()
export class EventsGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly roomsService: RoomsService
  ) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies[ACCESS_TOKEN_COOKIE_NAME];
    if (!accessToken) return false;
    try {
      const payload = this.jwtService.verify<UserData>(accessToken, { algorithms: ['HS256'] });
      const user = this.roomsService.getUserById(payload.id);
      if (!user) throw new Error('User not found');
      const room = this.roomsService.getRoomById(user.roomId);
      if (!room) throw new Error('Room not found');
      request.userData = { user, room };
      return true;
    } catch {
      return false;
    }
  }
}
