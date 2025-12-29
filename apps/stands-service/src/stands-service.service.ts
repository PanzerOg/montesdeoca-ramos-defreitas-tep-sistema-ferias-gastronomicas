import { Injectable } from '@nestjs/common';

@Injectable()
export class StandsServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
