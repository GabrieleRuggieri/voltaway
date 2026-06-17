import { Global, Module } from '@nestjs/common';
import { createDb, type Db } from '@voltaway/db';

export const DB = Symbol('DB');

@Global()
@Module({
  providers: [
    {
      provide: DB,
      useFactory: (): Db => {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error('DATABASE_URL is required');
        return createDb(url);
      },
    },
  ],
  exports: [DB],
})
export class DbModule {}
