import os from 'node:os';
import { Injectable } from '@nestjs/common';
import { createWorker } from 'mediasoup';
import { Worker } from 'mediasoup/types';
import { env, isProduction } from 'src/env';

@Injectable()
export class WorkerService {
  readonly #workers: Worker[] = [];

  // For now its the simplest Round-Robin
  getWorker() {
    return this.#workers[Math.floor(Math.random() * this.#workers.length)];
  }

  async createWorkers() {
    const numWorkers = env.MEDIASOUP_WORKERS || os.cpus().length;
    const workers = [];
    for (let i = 0; i < numWorkers; i++) {
      workers.push(this.#createWorker());
    }
    this.#workers.push(...(await Promise.all(workers)));
    console.log(`Created ${this.#workers.length} MediaSoup workers`);
  }

  async disposeWorkers() {
    for (const worker of this.#workers) {
      if (!worker.closed) worker.close();
    }
    this.#workers.length = 0;
  }

  async #createWorker() {
    const worker = await createWorker({
      logLevel: isProduction ? 'warn' : 'debug',
      logTags: [
        'bwe',
        'dtls',
        'ice',
        'info',
        'message',
        'rtcp',
        'rtp',
        'rtx',
        'score',
        'sctp',
        'simulcast',
        'srtp',
        'svc',
      ],
      rtcMinPort: env.MEDIASOUP_MIN_PORT,
      rtcMaxPort: env.MEDIASOUP_MAX_PORT,
    });
    return worker;
  }
}
