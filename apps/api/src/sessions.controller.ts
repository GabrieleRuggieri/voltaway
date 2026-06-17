import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { evses, sessions, stations, type Db } from '@voltaway/db';
import type { OcpiClient } from '@voltaway/ocpi';
import { and, eq } from 'drizzle-orm';
import { DB } from './db.module';
import { OCPI } from './ocpi.module';
import { DEFAULT_ESTIMATE, finalTotalFromCdr, quoteFromOcpiTariff } from './pricing';

type StartSessionDto = {
  ocpiLocationId: string;
  ocpiEvseUid: string;
  estimateKwh?: number;
  estimateMinutes?: number;
};

@Controller('sessions')
export class SessionsController {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(OCPI) private readonly ocpi: OcpiClient,
  ) {}

  @Get(':id')
  async get(@Param('id') id: string) {
    const row = await this.findSession(id);
    return { data: await this.toResponse(row) };
  }

  @Post()
  async start(@Body() body: StartSessionDto) {
    const { ocpiLocationId, ocpiEvseUid } = body;
    if (!ocpiLocationId || !ocpiEvseUid) {
      throw new BadRequestException('ocpiLocationId and ocpiEvseUid are required');
    }

    const evseRow = await this.db
      .select({
        evse: evses,
        station: stations,
      })
      .from(evses)
      .innerJoin(stations, eq(evses.stationId, stations.id))
      .where(and(eq(evses.ocpiEvseUid, ocpiEvseUid), eq(stations.ocpiLocationId, ocpiLocationId)))
      .limit(1);

    const match = evseRow[0];
    if (!match) {
      throw new NotFoundException('EVSE not found');
    }

    const [liveStatus] = await this.ocpi.getStatus([ocpiEvseUid]);
    if (liveStatus?.status !== 'AVAILABLE') {
      throw new BadRequestException('EVSE is not available');
    }

    const activeOnEvse = await this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.evseId, match.evse.id), eq(sessions.status, 'ACTIVE')))
      .limit(1);
    if (activeOnEvse.length > 0) {
      throw new BadRequestException('EVSE already has an active session');
    }

    const tariffId = match.evse.tariffId ?? 'tariff-standard';
    const ocpiTariff = await this.ocpi.getTariff(tariffId);
    if (!ocpiTariff) {
      throw new BadRequestException('Tariff not found');
    }

    const estimate = {
      kWh: body.estimateKwh ?? DEFAULT_ESTIMATE.kWh,
      minutes: body.estimateMinutes ?? DEFAULT_ESTIMATE.minutes,
    };
    const quote = quoteFromOcpiTariff(ocpiTariff, estimate);

    const [created] = await this.db
      .insert(sessions)
      .values({
        evseId: match.evse.id,
        status: 'STARTING',
        quotedAllInPerKwh: quote.allInPerKwh,
        quotedTotal: quote.totalEstimate,
        currency: quote.currency,
      })
      .returning();

    try {
      const ref = await this.ocpi.startSession({
        locationId: ocpiLocationId,
        evseUid: ocpiEvseUid,
        tokenUid: 'demo-user',
      });

      const [active] = await this.db
        .update(sessions)
        .set({
          status: 'ACTIVE',
          ocpiSessionId: ref.sessionId,
          updatedAt: new Date(),
        })
        .where(eq(sessions.id, created!.id))
        .returning();

      await this.db.update(evses).set({ status: 'CHARGING' }).where(eq(evses.id, match.evse.id));

      return { data: await this.toResponse(active!) };
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'OCPI start failed';
      await this.db
        .update(sessions)
        .set({
          status: 'FAILED',
          failureReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(sessions.id, created!.id));
      throw new BadRequestException(reason);
    }
  }

  @Post(':id/stop')
  async stop(@Param('id') id: string) {
    const row = await this.findSession(id);
    if (row.status !== 'ACTIVE') {
      throw new BadRequestException('Session is not active');
    }
    if (!row.ocpiSessionId) {
      throw new BadRequestException('Missing OCPI session reference');
    }

    await this.db
      .update(sessions)
      .set({ status: 'STOPPING', updatedAt: new Date() })
      .where(eq(sessions.id, id));

    const ref = { sessionId: row.ocpiSessionId, authorizationReference: '' };

    try {
      await this.ocpi.stopSession(ref);
      const cdr = await this.ocpi.getCdr(ref);
      const finalTotal = finalTotalFromCdr(cdr.total_cost.incl_vat);

      const [completed] = await this.db
        .update(sessions)
        .set({
          status: 'COMPLETED',
          finalKwh: cdr.total_energy,
          finalTotal,
          updatedAt: new Date(),
        })
        .where(eq(sessions.id, id))
        .returning();

      await this.db.update(evses).set({ status: 'AVAILABLE' }).where(eq(evses.id, row.evseId));

      return { data: await this.toResponse(completed!) };
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'OCPI stop failed';
      await this.db
        .update(sessions)
        .set({
          status: 'FAILED',
          failureReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(sessions.id, id));
      throw new BadRequestException(reason);
    }
  }

  private async findSession(id: string) {
    const rows = await this.db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    const row = rows[0];
    if (!row) throw new NotFoundException('Session not found');
    return row;
  }

  private async toResponse(row: typeof sessions.$inferSelect) {
    const evseRow = await this.db
      .select({
        evse: evses,
        station: stations,
      })
      .from(evses)
      .innerJoin(stations, eq(evses.stationId, stations.id))
      .where(eq(evses.id, row.evseId))
      .limit(1);

    const ctx = evseRow[0];
    return {
      id: row.id,
      status: row.status,
      ocpiSessionId: row.ocpiSessionId,
      quotedAllInPerKwh: row.quotedAllInPerKwh,
      quotedTotal: row.quotedTotal,
      finalKwh: row.finalKwh,
      finalTotal: row.finalTotal,
      failureReason: row.failureReason,
      currency: row.currency,
      stationName: ctx?.station.name ?? null,
      evseUid: ctx?.evse.ocpiEvseUid ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
