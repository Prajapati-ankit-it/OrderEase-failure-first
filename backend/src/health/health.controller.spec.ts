import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            getLiveness: jest.fn(),
            getReadiness: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLiveness', () => {
    it('should return liveness status', () => {
      const mockResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
      };
      const getLivenessSpy = jest
        .spyOn(service, 'getLiveness')
        .mockReturnValue(mockResponse);

      const result = controller.getLiveness();
      expect(result).toEqual(mockResponse);
      expect(getLivenessSpy).toHaveBeenCalled();
    });
  });

  describe('getReadiness', () => {
    it('should return readiness status', async () => {
      const mockResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        checks: {
          database: {
            status: 'ok',
            responseTime: '5ms',
          },
        },
      };
      const getReadinessSpy = jest
        .spyOn(service, 'getReadiness')
        .mockResolvedValue(mockResponse);

      const result = await controller.getReadiness();
      expect(result).toEqual(mockResponse);
      expect(getReadinessSpy).toHaveBeenCalled();
    });
  });
});
