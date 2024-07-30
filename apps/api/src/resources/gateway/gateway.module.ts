import { Module } from '@nestjs/common';
import { GatewayService } from './math.gateway';

@Module({
  providers: [GatewayService],
})
export class GatewayModule {}
