import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      success: true,
      message: 'Welcome to OrderEase RBAC API',
      version: '1.0.0',
      documentation: {
        auth: {
          signup: 'POST /api/auth/signup',
          login: 'POST /api/auth/login',
          refresh: 'POST /api/auth/refresh',
        },
        public: {
          health: 'GET /api/public/health',
          menu: 'GET /api/public/menu',
          categories: 'GET /api/public/categories',
        },
        user: {
          profile: 'GET /api/user/profile',
          updateProfile: 'PUT /api/user/profile',
          updatePassword: 'PUT /api/user/password',
          orders: 'GET /api/user/orders',
        },
        admin: {
          dashboard: 'GET /api/admin/dashboard',
          users: 'GET /api/admin/users',
          userById: 'GET /api/admin/users/:id',
          updateUserRole: 'PUT /api/admin/users/:id/role',
        },
        order: {
          create: 'POST /api/order',
          list: 'GET /api/order (admin)',
          getById: 'GET /api/order/:id',
          updateStatus: 'PUT /api/order/:id/status (admin)',
        },
        food: {
          create: 'POST /api/food (admin)',
          list: 'GET /api/food (admin)',
          getById: 'GET /api/food/:id (admin)',
          update: 'PUT /api/food/:id (admin)',
          delete: 'DELETE /api/food/:id (admin)',
        },
      },
    };
  }

  getHealth() {
    return {
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'OrderEase RBAC API',
      version: '1.0.0',
    };
  }
}
