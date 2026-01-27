// import { PrismaService } from '@orderease/shared-database';

// /**
//  * Extended PrismaService for testing with cleanup utilities
//  */
// export class TestPrismaService extends PrismaService {
//   /**
//    * Clean all test data from database
//    */
//   async cleanDatabase() {
//     // Delete in correct order to respect foreign key constraints
//     await this.cartItem.deleteMany();
//     await this.cart.deleteMany();
//     await this.orderItem.deleteMany();
//     await this.order.deleteMany();
//     await this.food.deleteMany();
//     await this.user.deleteMany();
//   }

//   /**
//    * Reset database to clean state for tests
//    */
//   async resetDatabase() {
//     await this.cleanDatabase();
//   }
// }

// /**
//  * Create a new test Prisma service instance
//  */
// export const createTestPrismaService = () => {
//   const service = new TestPrismaService();
//   return service;
// };
