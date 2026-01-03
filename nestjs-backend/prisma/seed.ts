import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.food.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleared existing data\n');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@orderease.com',
      password: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin user created:');
  console.log('   Email: admin@orderease.com');
  console.log('   Password: admin123\n');

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@orderease.com',
      password: userPassword,
      name: 'Regular User',
      role: Role.USER,
    },
  });
  console.log('✅ Regular user created:');
  console.log('   Email: user@orderease.com');
  console.log('   Password: user123\n');

  // Create sample food items
  const foods = await prisma.food.createMany({
    data: [
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        category: 'Pizza',
        isAvailable: true,
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Pizza with tomato sauce, mozzarella, and pepperoni',
        price: 14.99,
        category: 'Pizza',
        isAvailable: true,
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing and croutons',
        price: 8.99,
        category: 'Salads',
        isAvailable: true,
      },
      {
        name: 'Grilled Chicken',
        description: 'Tender grilled chicken breast with herbs',
        price: 16.99,
        category: 'Main Course',
        isAvailable: true,
      },
      {
        name: 'Pasta Carbonara',
        description: 'Classic Italian pasta with bacon and parmesan',
        price: 13.99,
        category: 'Pasta',
        isAvailable: true,
      },
      {
        name: 'Tiramisu',
        description: 'Classic Italian coffee-flavored dessert',
        price: 7.99,
        category: 'Desserts',
        isAvailable: true,
      },
      {
        name: 'Coca Cola',
        description: 'Refreshing carbonated soft drink',
        price: 2.99,
        category: 'Beverages',
        isAvailable: true,
      },
      {
        name: 'Lemonade',
        description: 'Fresh squeezed lemonade',
        price: 3.99,
        category: 'Beverages',
        isAvailable: true,
      },
    ],
  });
  console.log(`✅ Created ${foods.count} food items\n`);

  // Create a sample order for the regular user
  const foodItems = await prisma.food.findMany({ take: 2 });
  if (foodItems.length >= 2) {
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalPrice: foodItems[0].price + foodItems[1].price,
        status: 'PENDING',
        orderItems: {
          create: [
            {
              foodId: foodItems[0].id,
              quantity: 1,
              price: foodItems[0].price,
            },
            {
              foodId: foodItems[1].id,
              quantity: 1,
              price: foodItems[1].price,
            },
          ],
        },
      },
    });
    console.log(`✅ Created sample order: ${order.id}\n`);
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
