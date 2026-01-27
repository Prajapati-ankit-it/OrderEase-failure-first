// import { Role } from '@orderease/shared-contracts';
// import { PrismaService } from '@orderease/shared-database';
// import { hashPassword } from '@orderease/shared-utils';

// /**
//  * Factory helpers for creating test data
//  */

// let userCounter = 0;
// let foodCounter = 0;
// // let orderCounter = 0;

// /**
//  * Reset counters (useful between tests)
//  */
// export function resetFactoryCounters() {
//   userCounter = 0;
//   foodCounter = 0;
//   // orderCounter = 0;
// }

// /**
//  * Create a test user
//  */
// export async function createTestUser(
//   prisma: PrismaService,
//   overrides?: Partial<{
//     email: string;
//     password: string;
//     name: string;
//     role: Role;
//   }>,
// ) {
//   const email = overrides?.email || `testuser${++userCounter}@example.com`;
//   const password = overrides?.password || 'password123';
//   const hashedPassword = await hashPassword(password);

//   return prisma.user.create({
//     data: {
//       email,
//       password: hashedPassword,
//       name: overrides?.name || `Test User ${userCounter}`,
//       role: overrides?.role || Role.USER,
//     },
//   });
// }

// /**
//  * Create a test admin user
//  */
// export async function createTestAdmin(
//   prisma: PrismaService,
//   overrides?: Partial<{
//     email: string;
//     password: string;
//     name: string;
//   }>,
// ) {
//   return createTestUser(prisma, {
//     ...overrides,
//     role: Role.ADMIN,
//   });
// }

// /**
//  * Create a test food item
//  */
// export async function createTestFood(
//   prisma: PrismaService,
//   overrides?: Partial<{
//     name: string;
//     description: string;
//     price: number;
//     category: string;
//     image: string;
//     isAvailable: boolean;
//   }>,
// ) {
//   return prisma.food.create({
//     data: {
//       name: overrides?.name || `Test Food ${++foodCounter}`,
//       description:
//         overrides?.description || `Description for test food ${foodCounter}`,
//       price: overrides?.price ?? 10.99,
//       category: overrides?.category || 'Test Category',
//       image: overrides?.image || `https://example.com/food${foodCounter}.jpg`,
//       isAvailable: overrides?.isAvailable ?? true,
//     },
//   });
// }

// /**
//  * Create a test cart with items
//  */
// export async function createTestCart(
//   prisma: PrismaService,
//   userId: string,
//   foodItems: Array<{ foodId: string; quantity: number }> = [],
// ) {
//   const cart = await prisma.cart.create({
//     data: {
//       userId,
//     },
//   });

//   if (foodItems.length > 0) {
//     await prisma.cartItem.createMany({
//       data: foodItems.map((item) => ({
//         cartId: cart.id,
//         foodId: item.foodId,
//         quantity: item.quantity,
//       })),
//     });
//   }

//   return prisma.cart.findUnique({
//     where: { id: cart.id },
//     include: {
//       cartItems: {
//         include: {
//           food: true,
//         },
//       },
//     },
//   });
// }

// /**
//  * Create a test order
//  */
// export async function createTestOrder(
//   prisma: PrismaService,
//   userId: string,
//   orderItems: Array<{ foodId: string; quantity: number; price: number }>,
// ) {
//   const totalPrice = orderItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0,
//   );

//   return prisma.order.create({
//     data: {
//       userId,
//       totalPrice,
//       orderItems: {
//         create: orderItems,
//       },
//     },
//     include: {
//       orderItems: {
//         include: {
//           food: true,
//         },
//       },
//     },
//   });
// }

// /**
//  * Create multiple test food items at once
//  */
// export async function createTestFoods(
//   prisma: PrismaService,
//   count: number,
//   overrides?: Partial<{
//     category: string;
//     isAvailable: boolean;
//     price: number;
//   }>,
// ) {
//   const foods: Awaited<ReturnType<typeof createTestFood>>[] = [];
//   for (let i = 0; i < count; i++) {
//     const food = await createTestFood(prisma, overrides);
//     foods.push(food);
//   }
//   return foods;
// }
