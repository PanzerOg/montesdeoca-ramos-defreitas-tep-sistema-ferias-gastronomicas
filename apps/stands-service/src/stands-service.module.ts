import { Module } from '@nestjs/common';
import { StandsServiceController } from './stands-service.controller';
import { StandsServiceService } from './stands-service.service';

@Module({
  imports: [],
  controllers: [StandsServiceController],
  providers: [StandsServiceService],
})
export class StandsServiceModule {}
