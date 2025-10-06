import { Module } from '@nestjs/common';
import { MediasoupModule } from 'src/mediasoup/mediasoup.module';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
  imports: [MediasoupModule],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
