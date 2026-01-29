import { PrismaClient, Role, OrderEventType, OrderEventSource, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting failure-first database seeding...\n');

  // ===============================
  // CLEANUP (order matters!)
  // ===============================
  await prisma.orderEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.food.deleteMany();
  await prisma.idempotencyKey.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data\n');

  // ===============================
  // USERS
  // ===============================
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@orderease.com',
      password: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@orderease.com',
      password: userPassword,
      name: 'Regular User',
      role: Role.USER,
    },
  });

  console.log('✅ Users created');
  console.log('   Admin → admin@orderease.com / admin123');
  console.log('   User  → user@orderease.com / user123\n');

  // ===============================
  // FOODS
  // ===============================
  await prisma.food.createMany({
    data: [
      { name: 'Margherita Pizza', description: 'Classic pizza', price: 1299, category: 'Pizza' }, // $12.99 in cents
      { name: 'Pepperoni Pizza', description: 'Pepperoni & cheese', price: 1499, category: 'Pizza' }, // $14.99 in cents
      { name: 'Pasta Carbonara', description: 'Italian pasta', price: 1399, category: 'Pasta' }, // $13.99 in cents
      { name: 'Coca Cola', description: 'Cold drink', price: 299, category: 'Beverages' }, // $2.99 in cents
    ],
  });

  const foods = await prisma.food.findMany({ take: 2 });
  console.log(`✅ Created food catalog (${foods.length} items used for order)\n`);

  // ===============================
  // IDEMPOTENCY KEY
  // ===============================
  const idemKey = 'idem_seed_order_001';

  await prisma.idempotencyKey.create({
    data: {
      key: idemKey,
      requestHash: 'hash_cart_seed_001',
      response: { note: 'Seed order creation' },
    },
  });

  // ===============================
  // ORDER (IDENTITY ONLY)
  // ===============================
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      idempotencyKey: idemKey,
    },
  });

  console.log(`✅ Order created (identity only): ${order.id}\n`);

  // ===============================
  // ORDER ITEMS (SNAPSHOT)
  // ===============================
  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order.id,
        foodId: foods[0].id,
        foodName: foods[0].name,
        price: foods[0].price,
        quantity: 1,
      },
      {
        orderId: order.id,
        foodId: foods[1].id,
        foodName: foods[1].name,
        price: foods[1].price,
        quantity: 2,
      },
    ],
  });

  console.log('✅ Order items snapshotted\n');

  // ===============================
  // PAYMENT
  // ===============================
  // Prices are now in cents, calculate total in cents
  const totalAmount =
    foods[0].price * 1 +
    foods[1].price * 2;

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: 'FAKE_GATEWAY',
      amount: totalAmount,
      status: PaymentStatus.SUCCEEDED,
    },
  });

  console.log(`✅ Payment created: ${payment.id}\n`);

  // ===============================
  // ORDER EVENTS (SOURCE OF TRUTH)
  // ===============================
  await prisma.orderEvent.createMany({
    data: [
      {
        orderId: order.id,
        type: OrderEventType.ORDER_REQUESTED,
        payload: { message: 'User placed order' },
        causedBy: OrderEventSource.USER,
      },
      {
        orderId: order.id,
        type: OrderEventType.ORDER_VALIDATED,
        payload: { message: 'Cart validated' },
        causedBy: OrderEventSource.SYSTEM,
      },
      {
        orderId: order.id,
        type: OrderEventType.PAYMENT_INITIATED,
        payload: { provider: 'FAKE_GATEWAY' },
        causedBy: OrderEventSource.SYSTEM,
        paymentId: payment.id,
      },
      {
        orderId: order.id,
        type: OrderEventType.PAYMENT_SUCCEEDED,
        payload: { transaction: 'seed_txn_success' },
        causedBy: OrderEventSource.PAYMENT_GATEWAY,
        paymentId: payment.id,
      },
      {
        orderId: order.id,
        type: OrderEventType.ORDER_CONFIRMED,
        payload: { message: 'Order confirmed successfully' },
        causedBy: OrderEventSource.SYSTEM,
      },
    ],
  });

  console.log('✅ Order events appended (full lifecycle)\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
