import { Global, Module } from '@nestjs/common';

import { HashService } from './services/hash.service';
import { UuidService } from './services/uuid.service';

@Global()
@Module({
  providers: [HashService, UuidService],
  exports: [HashService, UuidService],
})
export class SharedModule {}
