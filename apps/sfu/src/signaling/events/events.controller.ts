import { Controller, Req, Sse, UseGuards } from '@nestjs/common';
import { Room } from 'src/rooms/entities/Room';
import { User } from 'src/rooms/entities/User';
import { SignalingService } from '../signaling.service';
import { EventsGuard } from './events.guard';

@Controller('signaling')
export class EventsController {
  constructor(private readonly signalingService: SignalingService) {}

  @Sse('events')
  @UseGuards(EventsGuard)
  subscribe(@Req() { userData }: { userData: { user: User; room: Room } }) {
    return this.signalingService.subscribeUserToRoomEvents(userData.user.id, userData.room.id);
  }
}
