import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service';
import { PrismaService } from '../database';
import { createMockPrismaService } from '../test-utils';
import { MESSAGES } from '../constants';
import { OrderStatus } from './order.dto';

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: ReturnType<typeof createMockPrismaService>;

  const mockFood = {
    id: 'food-1',
    name: 'Pizza',
    description: 'Delicious pizza',
    price: 15.99,
    category: 'Italian',
    image: 'pizza.jpg',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrder = {
    id: 'order-1',
    userId: 'user-1',
    totalPrice: 31.98,
    status: OrderStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    orderItems: [
      {
        id: 'item-1',
        orderId: 'order-1',
        foodId: 'food-1',
        quantity: 2,
        price: 15.99,
        food: mockFood,
      },
    ],
  };

  const mockCart = {
    id: 'cart-1',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    cartItems: [
      {
        id: 'cart-item-1',
        cartId: 'cart-1',
        foodId: 'food-1',
        quantity: 2,
        food: mockFood,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  beforeEach(async () => {
    prismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createOrderDto = {
      items: [
        { foodId: 'food-1', quantity: 2 },
      ],
    };

    it('should successfully create an order', async () => {
      prismaService.food.findMany.mockResolvedValue([mockFood]);
      prismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.create('user-1', createOrderDto);

      expect(prismaService.food.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['food-1'] },
          isAvailable: true,
        },
      });
      expect(prismaService.order.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          totalPrice: 31.98,
          orderItems: {
            create: [
              {
                foodId: 'food-1',
                quantity: 2,
                price: 15.99,
              },
            ],
          },
        },
        include: {
          orderItems: {
            include: { food: true },
          },
        },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if some food items are not available', async () => {
      prismaService.food.findMany.mockResolvedValue([]);

      await expect(service.create('user-1', createOrderDto)).rejects.toThrow(NotFoundException);
      await expect(service.create('user-1', createOrderDto)).rejects.toThrow('Some food items are not available');
    });

    it('should throw NotFoundException if food item not found in the list', async () => {
      const createOrderDtoMultiple = {
        items: [
          { foodId: 'food-1', quantity: 2 },
          { foodId: 'food-2', quantity: 1 },
        ],
      };

      prismaService.food.findMany.mockResolvedValue([mockFood]); // Only one food returned

      await expect(service.create('user-1', createOrderDtoMultiple)).rejects.toThrow(NotFoundException);
    });

    it('should calculate total price correctly for multiple items', async () => {
      const mockFood2 = { ...mockFood, id: 'food-2', price: 9.99 };
      const createOrderDtoMultiple = {
        items: [
          { foodId: 'food-1', quantity: 2 },
          { foodId: 'food-2', quantity: 3 },
        ],
      };

      prismaService.food.findMany.mockResolvedValue([mockFood, mockFood2]);
      prismaService.order.create.mockResolvedValue(mockOrder);

      await service.create('user-1', createOrderDtoMultiple);

      expect(prismaService.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalPrice: 61.95, // (15.99 * 2) + (9.99 * 3)
          }),
        }),
      );
    });
  });

  describe('createFromCart', () => {
    it('should successfully create an order from cart', async () => {
      prismaService.cart.findUnique.mockResolvedValue(mockCart);
      prismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          order: {
            create: jest.fn().mockResolvedValue(mockOrder),
          },
          cartItem: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        };
        return callback(mockPrisma);
      });

      const result = await service.createFromCart('user-1', { clearCart: true });

      expect(prismaService.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          cartItems: {
            include: {
              food: true,
            },
          },
        },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if cart is empty', async () => {
      prismaService.cart.findUnique.mockResolvedValue({
        ...mockCart,
        cartItems: [],
      });

      await expect(service.createFromCart('user-1', {})).rejects.toThrow(NotFoundException);
      await expect(service.createFromCart('user-1', {})).rejects.toThrow('Cart is empty');
    });

    it('should throw NotFoundException if cart does not exist', async () => {
      prismaService.cart.findUnique.mockResolvedValue(null);

      await expect(service.createFromCart('user-1', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if some items are unavailable', async () => {
      const cartWithUnavailableItem = {
        ...mockCart,
        cartItems: [
          {
            ...mockCart.cartItems[0],
            food: { ...mockFood, isAvailable: false },
          },
        ],
      };

      prismaService.cart.findUnique.mockResolvedValue(cartWithUnavailableItem);

      await expect(service.createFromCart('user-1', {})).rejects.toThrow(NotFoundException);
      await expect(service.createFromCart('user-1', {})).rejects.toThrow('Some items in your cart are no longer available');
    });

    it('should not clear cart if clearCart is false', async () => {
      prismaService.cart.findUnique.mockResolvedValue(mockCart);
      prismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          order: {
            create: jest.fn().mockResolvedValue(mockOrder),
          },
          cartItem: {
            deleteMany: jest.fn(),
          },
        };
        const result = await callback(mockPrisma);
        expect(mockPrisma.cartItem.deleteMany).not.toHaveBeenCalled();
        return result;
      });

      await service.createFromCart('user-1', { clearCart: false });
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const orders = [mockOrder];
      prismaService.order.findMany.mockResolvedValue(orders);
      prismaService.order.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, name: true } },
          orderItems: {
            include: { food: true },
          },
        },
      });
      expect(result).toEqual({
        orders,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should filter orders by status', async () => {
      const orders = [mockOrder];
      prismaService.order.findMany.mockResolvedValue(orders);
      prismaService.order.count.mockResolvedValue(1);

      await service.findAll(1, 10, OrderStatus.PENDING);

      expect(prismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: OrderStatus.PENDING },
        }),
      );
    });

    it('should calculate pagination correctly', async () => {
      prismaService.order.findMany.mockResolvedValue([]);
      prismaService.order.count.mockResolvedValue(25);

      const result = await service.findAll(2, 10);

      expect(prismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.pagination).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      prismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne('order-1');

      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: {
          user: { select: { id: true, email: true, name: true } },
          orderItems: {
            include: { food: true },
          },
        },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      prismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent')).rejects.toThrow(MESSAGES.GENERAL.NOT_FOUND);
    });
  });

  describe('updateStatus', () => {
    it('should successfully update order status', async () => {
      const updatedOrder = { ...mockOrder, status: OrderStatus.PREPARING };
      prismaService.order.findUnique.mockResolvedValue(mockOrder);
      prismaService.order.update.mockResolvedValue(updatedOrder);

      const result = await service.updateStatus('order-1', { status: OrderStatus.PREPARING });

      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: OrderStatus.PREPARING },
        include: {
          user: { select: { id: true, email: true, name: true } },
          orderItems: {
            include: { food: true },
          },
        },
      });
      expect(result).toEqual(updatedOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      prismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('non-existent', { status: OrderStatus.PREPARING })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should successfully delete an order', async () => {
      prismaService.order.findUnique.mockResolvedValue(mockOrder);
      prismaService.order.delete.mockResolvedValue(mockOrder);

      const result = await service.remove('order-1');

      expect(prismaService.order.delete).toHaveBeenCalledWith({
        where: { id: 'order-1' },
      });
      expect(result).toEqual({ message: 'Order deleted successfully' });
    });

    it('should throw NotFoundException if order not found', async () => {
      prismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
