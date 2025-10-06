import { Module } from '@nestjs/common';
import { MediasoupModule } from './mediasoup/mediasoup.module';
import { RoomsModule } from './rooms/rooms.module';
import { SignalingModule } from './signaling/signaling.module';

@Module({
  imports: [MediasoupModule, SignalingModule, RoomsModule],
})
export class AppModule {}
