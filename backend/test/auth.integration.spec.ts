import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { DatabaseModule } from '../src/database';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../src/database';
import { TestPrismaService } from '../src/test-utils';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let prismaService: TestPrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              jwt: {
                secret: 'test-jwt-secret',
                expiresIn: '1h',
                refreshSecret: 'test-refresh-secret',
                refreshExpiresIn: '7d',
              },
            }),
          ],
        }),
        DatabaseModule,
        AuthModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useClass(TestPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService) as TestPrismaService;
  });

  beforeEach(async () => {
    await prismaService.cleanDatabase();
  });

  afterAll(async () => {
    await prismaService.cleanDatabase();
    await app.close();
  });

  describe('POST /auth/signup', () => {
    it('should successfully register a new user', async () => {
      const signUpDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signUpDto)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(signUpDto.email);
      expect(response.body.user.name).toBe(signUpDto.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject duplicate email registration', async () => {
      const signUpDto = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'First User',
      };

      // First registration should succeed
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signUpDto)
        .expect(201);

      // Second registration with same email should fail
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signUpDto)
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          // missing password and name
        })
        .expect(400);
    });

    it('should validate email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const userCredentials = {
      email: 'testuser@example.com',
      password: 'password123',
      name: 'Test User',
    };

    beforeEach(async () => {
      // Create a user for login tests
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userCredentials);
    });

    it('should successfully login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(userCredentials.email);
    });

    it('should reject invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: userCredentials.password,
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid');
    });

    it('should reject invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userCredentials.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid');
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const signUpResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'refreshtest@example.com',
          password: 'password123',
          name: 'Refresh Test',
        });

      refreshToken = signUpResponse.body.refreshToken;
    });

    it('should successfully refresh tokens with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).not.toBe(refreshToken);
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('Auth Flow Integration', () => {
    it('should complete full registration → login → refresh flow', async () => {
      const userDto = {
        email: 'flowtest@example.com',
        password: 'password123',
        name: 'Flow Test User',
      };

      // Step 1: Sign up
      const signUpResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userDto)
        .expect(201);

      expect(signUpResponse.body).toHaveProperty('accessToken');
      expect(signUpResponse.body).toHaveProperty('refreshToken');
      const firstAccessToken = signUpResponse.body.accessToken;

      // Step 2: Login with the same credentials
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userDto.email,
          password: userDto.password,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(loginResponse.body.user.email).toBe(userDto.email);

      // Step 3: Refresh tokens
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: loginResponse.body.refreshToken })
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('accessToken');
      expect(refreshResponse.body.accessToken).not.toBe(firstAccessToken);
    });
  });
});
