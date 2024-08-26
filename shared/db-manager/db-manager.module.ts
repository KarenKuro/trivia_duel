import { Module } from '@nestjs/common';

import { DbManagerService } from './db-manager.service';

@Module({
  imports: [],
  providers: [DbManagerService],
  exports: [DbManagerService],
})
export class DbMnagerModule {}
