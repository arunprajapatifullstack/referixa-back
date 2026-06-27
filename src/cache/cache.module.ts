import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    NestCacheModule.register({
      ttl: 60000,
      max: 100,
      isGlobal: true,
    }),
  ],
})
export class CacheModule {}
