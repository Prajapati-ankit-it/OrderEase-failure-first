import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import * as request from 'supertest';

describe('AppModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should apply RequestContextMiddleware to all routes', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    // Check that x-request-id header is present in response
    expect(response.headers['x-request-id']).toBeDefined();
    expect(typeof response.headers['x-request-id']).toBe('string');
    expect(response.headers['x-request-id'].length).toBeGreaterThan(0);
  });

  it('should use existing x-request-id from request headers', async () => {
    const customRequestId = 'custom-request-id-12345';
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .set('x-request-id', customRequestId)
      .expect(200);

    // Check that the same request ID is returned
    expect(response.headers['x-request-id']).toBe(customRequestId);
  });

  it('should generate unique request IDs for different requests', async () => {
    const response1 = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    const response2 = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    const requestId1 = response1.headers['x-request-id'];
    const requestId2 = response2.headers['x-request-id'];

    expect(requestId1).toBeDefined();
    expect(requestId2).toBeDefined();
    expect(requestId1).not.toBe(requestId2);
  });

  it('should apply middleware to API routes', async () => {
    const response = await request(app.getHttpServer()).get('/api').expect(200);

    expect(response.headers['x-request-id']).toBeDefined();
  });

  it('should apply middleware to public routes', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/public/health')
      .expect(200);

    expect(response.headers['x-request-id']).toBeDefined();
  });
});
