import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database';
import { TestPrismaService, createTestUser, createTestFood } from '../src/test-utils';

interface TestFood {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  image?: string;
  isAvailable: boolean;
}

describe('Order Flow Integration Tests', () => {
  let app: INestApplication;
  let prismaService: TestPrismaService;
  let userAccessToken: string;
  let userId: string;
  let foodItems: TestFood[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

    // Create test user and get token
    const user = await createTestUser(prismaService, {
      email: 'ordertest@example.com',
      password: 'password123',
    });
    userId = user.id;

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'ordertest@example.com',
        password: 'password123',
      });

    userAccessToken = loginResponse.body.accessToken;

    // Create test food items
    const food1 = await createTestFood(prismaService, {
      name: 'Pizza',
      price: 12.99,
    });
    const food2 = await createTestFood(prismaService, {
      name: 'Burger',
      price: 8.99,
    });
    foodItems = [food1, food2];
  });

  afterAll(async () => {
    await prismaService.cleanDatabase();
    await app.close();
  });

  describe('Cart to Order Flow', () => {
    it('should complete full cart → order flow', async () => {
      // Step 1: Get empty cart
      const emptyCartResponse = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(emptyCartResponse.body.cartItems).toEqual([]);
      expect(emptyCartResponse.body.totalPrice).toBe(0);

      // Step 2: Add items to cart
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          foodId: foodItems[0].id,
          quantity: 2,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          foodId: foodItems[1].id,
          quantity: 1,
        })
        .expect(201);

      // Step 3: Get cart with items
      const cartResponse = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(cartResponse.body.cartItems).toHaveLength(2);
      expect(cartResponse.body.itemCount).toBe(2);
      expect(cartResponse.body.totalPrice).toBeGreaterThan(0);

      // Step 4: Create order from cart
      const orderResponse = await request(app.getHttpServer())
        .post('/orders/from-cart')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ clearCart: true })
        .expect(201);

      expect(orderResponse.body).toHaveProperty('id');
      expect(orderResponse.body.orderItems).toHaveLength(2);
      expect(orderResponse.body.status).toBe('PENDING');
      expect(orderResponse.body.userId).toBe(userId);

      // Step 5: Verify cart is cleared
      const clearedCartResponse = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(clearedCartResponse.body.cartItems).toEqual([]);
      expect(clearedCartResponse.body.totalPrice).toBe(0);
    });

    it('should handle order creation without clearing cart', async () => {
      // Add item to cart
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          foodId: foodItems[0].id,
          quantity: 2,
        })
        .expect(201);

      // Create order without clearing cart
      await request(app.getHttpServer())
        .post('/orders/from-cart')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ clearCart: false })
        .expect(201);

      // Verify cart still has items
      const cartResponse = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(cartResponse.body.cartItems).toHaveLength(1);
    });
  });

  describe('Direct Order Creation', () => {
    it('should create order directly without cart', async () => {
      const orderDto = {
        items: [
          {
            foodId: foodItems[0].id,
            quantity: 2,
          },
          {
            foodId: foodItems[1].id,
            quantity: 1,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(orderDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.orderItems).toHaveLength(2);
      expect(response.body.totalPrice).toBeGreaterThan(0);
      expect(response.body.status).toBe('PENDING');
    });

    it('should reject order with unavailable food items', async () => {
      // Create unavailable food
      const unavailableFood = await createTestFood(prismaService, {
        name: 'Unavailable Item',
        price: 10.0,
        isAvailable: false,
      });

      const orderDto = {
        items: [
          {
            foodId: unavailableFood.id,
            quantity: 1,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(orderDto)
        .expect(404);
    });
  });

  describe('Cart Management', () => {
    it('should update cart item quantity', async () => {
      // Add item to cart
      const addResponse = await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          foodId: foodItems[0].id,
          quantity: 2,
        })
        .expect(201);

      const cartItemId = addResponse.body.cartItems[0].id;

      // Update quantity
      await request(app.getHttpServer())
        .patch(`/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ quantity: 5 })
        .expect(200);

      // Verify update
      const cartResponse = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(cartResponse.body.cartItems[0].quantity).toBe(5);
    });

    it('should remove item from cart when quantity set to 0', async () => {
      // Add item to cart
      const addResponse = await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          foodId: foodItems[0].id,
          quantity: 2,
        })
        .expect(201);

      const cartItemId = addResponse.body.cartItems[0].id;

      // Set quantity to 0
      await request(app.getHttpServer())
        .patch(`/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ quantity: 0 })
        .expect(200);

      // Verify item removed
      const cartResponse = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(cartResponse.body.cartItems).toEqual([]);
    });

    it('should delete cart item', async () => {
      // Add item to cart
      const addResponse = await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          foodId: foodItems[0].id,
          quantity: 2,
        })
        .expect(201);

      const cartItemId = addResponse.body.cartItems[0].id;

      // Delete item
      await request(app.getHttpServer())
        .delete(`/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      // Verify deletion
      const cartResponse = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(cartResponse.body.cartItems).toEqual([]);
    });

    it('should clear entire cart', async () => {
      // Add multiple items
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ foodId: foodItems[0].id, quantity: 2 });

      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ foodId: foodItems[1].id, quantity: 1 });

      // Clear cart
      await request(app.getHttpServer())
        .delete('/cart')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      // Verify cart is empty
      const cartResponse = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(cartResponse.body.cartItems).toEqual([]);
    });
  });

  describe('User Orders', () => {
    it('should retrieve user order history', async () => {
      // Create an order
      const orderDto = {
        items: [
          {
            foodId: foodItems[0].id,
            quantity: 2,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(orderDto)
        .expect(201);

      // Get user orders
      const response = await request(app.getHttpServer())
        .get('/user/orders')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(response.body.orders).toHaveLength(1);
      expect(response.body.pagination).toHaveProperty('total', 1);
      expect(response.body.orders[0]).toHaveProperty('orderItems');
    });

    it('should handle pagination for user orders', async () => {
      // Create multiple orders
      const orderDto = {
        items: [{ foodId: foodItems[0].id, quantity: 1 }],
      };

      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${userAccessToken}`)
          .send(orderDto);
      }

      // Get first page
      const response = await request(app.getHttpServer())
        .get('/user/orders?page=1&limit=2')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(response.body.orders).toHaveLength(2);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.totalPages).toBe(2);
    });
  });

  describe('Authorization', () => {
    it('should reject unauthenticated cart access', async () => {
      await request(app.getHttpServer()).get('/cart').expect(401);
    });

    it('should reject unauthenticated order creation', async () => {
      const orderDto = {
        items: [{ foodId: foodItems[0].id, quantity: 1 }],
      };

      await request(app.getHttpServer()).post('/orders').send(orderDto).expect(401);
    });
  });
});
