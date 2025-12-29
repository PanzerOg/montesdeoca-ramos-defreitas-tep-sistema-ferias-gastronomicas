import { Test, TestingModule } from '@nestjs/testing';
import { StandsServiceController } from './stands-service.controller';
import { StandsServiceService } from './stands-service.service';

describe('StandsServiceController', () => {
  let standsServiceController: StandsServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StandsServiceController],
      providers: [StandsServiceService],
    }).compile();

    standsServiceController = app.get<StandsServiceController>(StandsServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(standsServiceController.getHello()).toBe('Hello World!');
    });
  });
});
