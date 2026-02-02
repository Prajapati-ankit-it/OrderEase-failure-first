import { Test, TestingModule } from '@nestjs/testing';
import { IpThrottlerGuard } from './ip-throttler.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('IpThrottlerGuard', () => {
  let guard: IpThrottlerGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          throttlers: [
            {
              name: 'test',
              ttl: 60000,
              limit: 10,
            },
          ],
        }),
      ],
      providers: [
        IpThrottlerGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<IpThrottlerGuard>(IpThrottlerGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getTracker', () => {
    it('should extract IP from X-Forwarded-For header', async () => {
      const mockRequest: any = {
        headers: {
          'x-forwarded-for': '192.168.1.100, 10.0.0.1',
        },
        ip: '127.0.0.1',
        socket: { remoteAddress: '127.0.0.1' },
      };

      const ip = await guard['getTracker'](mockRequest);
      expect(ip).toBe('192.168.1.100');
    });

    it('should extract IP from X-Forwarded-For header (single IP)', async () => {
      const mockRequest: any = {
        headers: {
          'x-forwarded-for': '192.168.1.100',
        },
        ip: '127.0.0.1',
        socket: { remoteAddress: '127.0.0.1' },
      };

      const ip = await guard['getTracker'](mockRequest);
      expect(ip).toBe('192.168.1.100');
    });

    it('should extract IP from X-Real-IP header when X-Forwarded-For is not present', async () => {
      const mockRequest: any = {
        headers: {
          'x-real-ip': '10.20.30.40',
        },
        ip: '127.0.0.1',
        socket: { remoteAddress: '127.0.0.1' },
      };

      const ip = await guard['getTracker'](mockRequest);
      expect(ip).toBe('10.20.30.40');
    });

    it('should fall back to req.ip when no proxy headers are present', async () => {
      const mockRequest: any = {
        headers: {},
        ip: '203.0.113.5',
        socket: { remoteAddress: '203.0.113.5' },
      };

      const ip = await guard['getTracker'](mockRequest);
      expect(ip).toBe('203.0.113.5');
    });

    it('should fall back to socket remoteAddress when req.ip is not available', async () => {
      const mockRequest: any = {
        headers: {},
        socket: { remoteAddress: '198.51.100.42' },
      };

      const ip = await guard['getTracker'](mockRequest);
      expect(ip).toBe('198.51.100.42');
    });

    it('should return "unknown" when no IP can be determined', async () => {
      const mockRequest: any = {
        headers: {},
        socket: {},
      };

      const ip = await guard['getTracker'](mockRequest);
      expect(ip).toBe('unknown');
    });

    it('should handle array values for X-Forwarded-For header', async () => {
      const mockRequest: any = {
        headers: {
          'x-forwarded-for': ['192.168.1.100, 10.0.0.1', '172.16.0.1'],
        },
        ip: '127.0.0.1',
        socket: { remoteAddress: '127.0.0.1' },
      };

      const ip = await guard['getTracker'](mockRequest);
      expect(ip).toBe('192.168.1.100');
    });

    it('should handle array values for X-Real-IP header', async () => {
      const mockRequest: any = {
        headers: {
          'x-real-ip': ['10.20.30.40', '172.16.0.1'],
        },
        ip: '127.0.0.1',
        socket: { remoteAddress: '127.0.0.1' },
      };

      const ip = await guard['getTracker'](mockRequest);
      expect(ip).toBe('10.20.30.40');
    });
  });
});
