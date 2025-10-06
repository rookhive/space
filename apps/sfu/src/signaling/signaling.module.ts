import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RoomsModule } from 'src/rooms/rooms.module';
import { MediasoupModule } from '../mediasoup/mediasoup.module';
import { EventsController } from './events/events.controller';
import { SignalingGuard } from './signaling.guard';
import { SignalingService } from './signaling.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('ACCESS_TOKEN_SECRET'),
      }),
    }),
    MediasoupModule,
    RoomsModule,
  ],
  controllers: [EventsController],
  providers: [SignalingService, SignalingGuard],
  exports: [SignalingService],
})
export class SignalingModule {}
