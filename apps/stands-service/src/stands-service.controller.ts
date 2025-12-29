import { Controller, Get } from '@nestjs/common';
import { StandsServiceService } from './stands-service.service';

@Controller()
export class StandsServiceController {
  constructor(private readonly standsServiceService: StandsServiceService) {}

  @Get()
  getHello(): string {
    return this.standsServiceService.getHello();
  }
}
