import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return welcome message', () => {
      const result = appController.getHello();
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Welcome to OrderEase RBAC API');
      expect(result).toHaveProperty('version', '1.0.0');
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('service', 'OrderEase RBAC API');
    });
  });
});
