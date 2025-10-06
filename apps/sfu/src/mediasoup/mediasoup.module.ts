import { Module } from '@nestjs/common';
import { MediasoupService } from './mediasoup.service';
import { RouterService } from './router.service';
import { WorkerService } from './worker.service';

@Module({
  providers: [MediasoupService, WorkerService, RouterService],
  exports: [MediasoupService, RouterService],
})
export class MediasoupModule {}
