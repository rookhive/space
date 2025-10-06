import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import type { RoomEvent } from '@repo/typesystem';
import { RouterService } from 'src/mediasoup/router.service';
import { User } from './entities/User';
import { RoomsService } from './rooms.service';

type RoomEventType = RoomEvent['type'];
type ExtractPayload<T extends RoomEventType> = Extract<RoomEvent, { type: T }>['payload'];

@Controller()
export class RoomsController {
  constructor(
    private readonly routerService: RouterService,
    private readonly roomsService: RoomsService
  ) {}

  @MessagePattern<RoomEventType>('room:created')
  async roomCreated(@Payload() payload: ExtractPayload<'room:created'>) {
    const router = await this.routerService.createRouter();
    await this.roomsService.createRoom(payload.roomId, router.id);
    return { success: true };
  }

  @EventPattern<RoomEventType>('room:disposed')
  roomDisposed(@Payload() payload: ExtractPayload<'room:disposed'>) {
    const room = this.roomsService.getRoomById(payload.roomId);
    if (!room) return;
    for (const user of room.users) this.#disposeUser(user);
    this.routerService.disposeRouter(room.routerId);
    this.roomsService.deleteRoom(payload.roomId);
  }

  @EventPattern<RoomEventType>('user:connected')
  userConnected(@Payload() payload: ExtractPayload<'user:connected'>) {
    this.roomsService.addUserToRoom(payload.userId, payload.roomId);
  }

  @EventPattern<RoomEventType>('user:disconnected')
  userDisconnected(@Payload() payload: ExtractPayload<'user:disconnected'>) {
    const user = this.roomsService.getUserById(payload.userId);
    if (user) this.#disposeUser(user);
    this.roomsService.deleteUserFromRoom(payload.userId, payload.roomId);
  }

  #disposeUser(user: User) {
    for (const producerId of user.producerIds) this.routerService.disposeProducer(producerId);
    for (const consumerId of user.consumerIds) this.routerService.disposeConsumer(consumerId);
    if (user.recvTransportId) this.routerService.disposeTransport(user.recvTransportId);
  }
}
