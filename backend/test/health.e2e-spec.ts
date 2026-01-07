import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Health Endpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/health/live (GET)', () => {
    it('should return liveness status', () => {
      return request(app.getHttpServer())
        .get('/api/health/live')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(new Date(res.body.timestamp as string)).toBeInstanceOf(Date);
        });
    });

    it('should respond quickly (< 50ms)', async () => {
      const startTime = Date.now();
      await request(app.getHttpServer()).get('/api/health/live').expect(200);
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(50);
    });

    it('should not expose sensitive data', () => {
      return request(app.getHttpServer())
        .get('/api/health/live')
        .expect(200)
        .expect((res) => {
          // Ensure only expected fields are present
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          expect(Object.keys(res.body)).toEqual(['status', 'timestamp']);
          // Ensure no database connection strings, passwords, etc.
          expect(JSON.stringify(res.body)).not.toMatch(
            /password|secret|key|token|connection/i,
          );
        });
    });
  });

  describe('/api/health/ready (GET)', () => {
    it('should return readiness status with database check', () => {
      return request(app.getHttpServer())
        .get('/api/health/ready')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('checks');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.checks).toHaveProperty('database');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.checks.database).toHaveProperty('status');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.checks.database).toHaveProperty('responseTime');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.checks.database.responseTime).toMatch(/^\d+ms$/);
        });
    });

    it('should respond quickly (< 50ms)', async () => {
      const startTime = Date.now();
      await request(app.getHttpServer()).get('/api/health/ready').expect(200);
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(50);
    });

    it('should not expose sensitive data', () => {
      return request(app.getHttpServer())
        .get('/api/health/ready')
        .expect(200)
        .expect((res) => {
          // Ensure no database connection strings, passwords, etc.
          const responseString = JSON.stringify(res.body);
          expect(responseString).not.toMatch(
            /password|secret|key|token|connection|host|port|username|database_url/i,
          );
        });
    });
  });
});
