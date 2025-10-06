import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WorkerService } from './worker.service';

@Injectable()
export class MediasoupService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly workerService: WorkerService) {}

  async onModuleInit() {
    await this.workerService.createWorkers();
  }

  async onModuleDestroy() {
    await this.workerService.disposeWorkers();
  }

  getWorker() {
    return this.workerService.getWorker();
  }
}
