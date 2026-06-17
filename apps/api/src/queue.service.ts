/**
 * @file queue.service.ts
 * @module @voltaway/api
 *
 * Scopo: Inizializza la coda BullMQ e pianifica il job ricorrente di sync disponibilità EVSE.
 * Flusso: api (QueueService) → Redis/BullMQ → worker (availability.sync)
 * Dipendenze: @nestjs/common, bullmq
 * Endpoint / export principali: QueueService
 */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private queue!: Queue;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL ?? 'redis://redis:6379';
    this.queue = new Queue('voltaway', { connection: { url: redisUrl } });

    // Job ripetuto ogni 60s: il worker chiama GET /stations/sync sull'API
    void this.queue.add(
      'availability.sync',
      {},
      {
        repeat: { every: 60_000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );
  }

  async onModuleDestroy() {
    await this.queue?.close();
  }
}
