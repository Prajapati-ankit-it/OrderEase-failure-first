import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

describe('Menu Endpoint (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same global configurations as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/menu', () => {
    it('should return 200 status code', () => {
      return request(app.getHttpServer()).get('/api/menu').expect(200);
    });

    it('should accept available query parameter', () => {
      return request(app.getHttpServer())
        .get('/api/menu?available=true')
        .expect(200);
    });

    it('should accept category query parameter', () => {
      return request(app.getHttpServer())
        .get('/api/menu?category=Main+Course')
        .expect(200);
    });

    it('should accept both available and category parameters', () => {
      return request(app.getHttpServer())
        .get('/api/menu?available=true&category=Desserts')
        .expect(200);
    });

    it('should return success response format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/menu')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toMatchObject({
        success: true,
      });
    });
  });

  describe('GET /api/menu/:id', () => {
    it('should return 404 for non-existent item', () => {
      // Using a sample ID that doesn't exist
      return request(app.getHttpServer())
        .get('/api/menu/test-id-123')
        .expect(404);
    });
  });
});
