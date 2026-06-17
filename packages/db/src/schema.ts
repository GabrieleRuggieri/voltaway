import {
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const evseStatusEnum = pgEnum('evse_status', [
  'AVAILABLE',
  'CHARGING',
  'BLOCKED',
  'OUTOFORDER',
  'UNKNOWN',
]);

export const sessionStatusEnum = pgEnum('session_status', [
  'QUOTED',
  'AUTHORIZING',
  'STARTING',
  'ACTIVE',
  'STOPPING',
  'SETTLING',
  'COMPLETED',
  'FAILED',
]);

export const cpos = pgTable('cpos', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const stations = pgTable('stations', {
  id: uuid('id').primaryKey().defaultRandom(),
  cpoId: uuid('cpo_id')
    .notNull()
    .references(() => cpos.id),
  ocpiLocationId: varchar('ocpi_location_id', { length: 64 }).notNull().unique(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  country: varchar('country', { length: 2 }).notNull().default('IT'),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const evses = pgTable('evses', {
  id: uuid('id').primaryKey().defaultRandom(),
  stationId: uuid('station_id')
    .notNull()
    .references(() => stations.id),
  ocpiEvseUid: varchar('ocpi_evse_uid', { length: 64 }).notNull().unique(),
  status: evseStatusEnum('status').notNull().default('UNKNOWN'),
  maxPowerKw: integer('max_power_kw').notNull(),
  tariffId: varchar('tariff_id', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  evseId: uuid('evse_id')
    .notNull()
    .references(() => evses.id),
  status: sessionStatusEnum('status').notNull().default('QUOTED'),
  ocpiSessionId: varchar('ocpi_session_id', { length: 64 }),
  quotedAllInPerKwh: doublePrecision('quoted_all_in_per_kwh'),
  quotedTotal: doublePrecision('quoted_total'),
  finalKwh: doublePrecision('final_kwh'),
  finalTotal: doublePrecision('final_total'),
  failureReason: text('failure_reason'),
  currency: varchar('currency', { length: 3 }).default('EUR'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
