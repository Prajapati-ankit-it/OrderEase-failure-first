import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../database';

describe('HealthService', () => {
  let service: HealthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLiveness', () => {
    it('should return liveness status', () => {
      const result = service.getLiveness();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('getReadiness', () => {
    it('should return readiness status with database check when DB is healthy', async () => {
      const queryRawSpy = jest
        .spyOn(prismaService, '$queryRaw')
        .mockResolvedValue([{ 1: 1 }]);

      const result = await service.getReadiness();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('checks');
      expect(result.checks).toHaveProperty('database');
      expect(result.checks.database).toHaveProperty('status', 'ok');
      expect(result.checks.database).toHaveProperty('responseTime');
      expect(result.checks.database.responseTime).toMatch(/^\d+ms$/);
      expect(queryRawSpy).toHaveBeenCalled();
    });

    it('should return error status when database is unhealthy', async () => {
      const dbError = new Error('Connection failed');
      jest.spyOn(prismaService, '$queryRaw').mockRejectedValue(dbError);

      const result = await service.getReadiness();
      expect(result).toHaveProperty('status', 'error');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('checks');
      expect(result.checks.database).toHaveProperty('status', 'error');
      expect(result.checks.database).toHaveProperty(
        'error',
        'Connection failed',
      );
      expect(result.checks.database).toHaveProperty('responseTime');
    });
  });
});
