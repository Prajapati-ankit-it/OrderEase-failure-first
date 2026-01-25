// import { Test, TestingModule } from '@nestjs/testing';
// import { NotFoundException, BadRequestException } from '@nestjs/common';
// import { OrderService } from './order.service';
// import { MESSAGES } from '@orderease/shared-contracts';
// import { OrderStatus } from '@orderease/shared-contracts';
// import { ORDER_REPOSITORY } from './infra/order.repository.interface';
// import { FOOD_REPOSITORY } from '../food/infra/food.repository.interface';
// import { CART_REPOSITORY } from '../cart/infra/cart.repository.interface';
// import { Order } from './domain/order.entity';
// import { Food } from '../food/domain/food.entity';
// import { Cart } from '../cart/domain/cart.entity';

// describe('OrderService', () => {
//   let service: OrderService;
//   let orderRepository: any;
//   let foodRepository: any;
//   let cartRepository: any;

//   const mockFood = new Food({
//     id: 'food-1',
//     name: 'Pizza',
//     description: 'Delicious pizza',
//     price: 15.99,
//     category: 'Italian',
//     image: 'pizza.jpg',
//     isAvailable: true,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   });

//   const mockOrder = new Order({
//     id: 'order-1',
//     userId: 'user-1',
//     items: [
//       {
//         foodId: 'food-1',
//         quantity: 2,
//         price: 15.99,
//       },
//     ],
//     status: OrderStatus.PENDING,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   });

//   const mockCart = new Cart({
//     id: 'cart-1',
//     userId: 'user-1',
//     items: [
//       {
//         foodId: 'food-1',
//         quantity: 2,
//       },
//     ],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   });

//   beforeEach(async () => {
//     // Create mock repositories
//     orderRepository = {
//       create: jest.fn(),
//       findById: jest.fn(),
//       findAll: jest.fn(),
//       updateStatus: jest.fn(),
//       delete: jest.fn(),
//     };

//     foodRepository = {
//       findAvailableByIds: jest.fn(),
//       findById: jest.fn(),
//     };

//     cartRepository = {
//       findByUserIdWithDetails: jest.fn(),
//       clearCart: jest.fn(),
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         OrderService,
//         { provide: ORDER_REPOSITORY, useValue: orderRepository },
//         { provide: FOOD_REPOSITORY, useValue: foodRepository },
//         { provide: CART_REPOSITORY, useValue: cartRepository },
//       ],
//     }).compile();

//     service = module.get<OrderService>(OrderService);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('create', () => {
//     const createOrderDto = {
//       items: [{ foodId: 'food-1', quantity: 2 }],
//     };

//     it('should successfully create an order', async () => {
//       foodRepository.findAvailableByIds.mockResolvedValue([mockFood]);
//       orderRepository.create.mockResolvedValue(mockOrder);

//       const result = await service.create('user-1', createOrderDto);

//       expect(foodRepository.findAvailableByIds).toHaveBeenCalledWith(['food-1']);
//       expect(orderRepository.create).toHaveBeenCalled();
//       expect(result).toEqual(mockOrder);
//     });

//     it('should throw NotFoundException if some food items are not available', async () => {
//       foodRepository.findAvailableByIds.mockResolvedValue([]);

//       await expect(service.create('user-1', createOrderDto)).rejects.toThrow(
//         NotFoundException,
//       );
//       await expect(service.create('user-1', createOrderDto)).rejects.toThrow(
//         'Some food items are not available',
//       );
//     });

//     it('should throw NotFoundException if food item not found in the list', async () => {
//       const createOrderDtoMultiple = {
//         items: [
//           { foodId: 'food-1', quantity: 2 },
//           { foodId: 'food-2', quantity: 1 },
//         ],
//       };

//       foodRepository.findAvailableByIds.mockResolvedValue([mockFood]); // Only one food returned

//       await expect(
//         service.create('user-1', createOrderDtoMultiple),
//       ).rejects.toThrow(NotFoundException);
//     });

//     it('should calculate total price correctly for multiple items', async () => {
//       const mockFood2 = new Food({
//         id: 'food-2',
//         name: 'Burger',
//         price: 9.99,
//         category: 'American',
//         isAvailable: true,
//       });
      
//       const createOrderDtoMultiple = {
//         items: [
//           { foodId: 'food-1', quantity: 2 },
//           { foodId: 'food-2', quantity: 3 },
//         ],
//       };

//       foodRepository.findAvailableByIds.mockResolvedValue([mockFood, mockFood2]);
      
//       const expectedOrder = new Order({
//         userId: 'user-1',
//         items: [
//           { foodId: 'food-1', quantity: 2, price: 15.99 },
//           { foodId: 'food-2', quantity: 3, price: 9.99 },
//         ],
//       });
//       orderRepository.create.mockResolvedValue(expectedOrder);

//       await service.create('user-1', createOrderDtoMultiple);

//       expect(orderRepository.create).toHaveBeenCalled();
//       const createdOrder = orderRepository.create.mock.calls[0][0];
//       expect(createdOrder.calculateTotal()).toBe(61.95); // (15.99 * 2) + (9.99 * 3)
//     });
//   });

//   describe('createFromCart', () => {
//     it('should successfully create an order from cart', async () => {
//       const cartWithDetails = {
//         cart: mockCart,
//         foodDetails: new Map([
//           ['food-1', { name: 'Pizza', price: 15.99, isAvailable: true }],
//         ]),
//       };
      
//       cartRepository.findByUserIdWithDetails.mockResolvedValue(cartWithDetails);
//       orderRepository.create.mockResolvedValue(mockOrder);
//       cartRepository.clearCart.mockResolvedValue(undefined);

//       const result = await service.createFromCart('user-1', {
//         clearCart: true,
//       });

//       expect(cartRepository.findByUserIdWithDetails).toHaveBeenCalledWith('user-1');
//       expect(cartRepository.clearCart).toHaveBeenCalledWith('user-1');
//       expect(result).toEqual(mockOrder);
//     });

//     it('should throw NotFoundException if cart is empty', async () => {
//       const emptyCart = new Cart({
//         id: 'cart-1',
//         userId: 'user-1',
//         items: [],
//       });
      
//       const cartWithDetails = {
//         cart: emptyCart,
//         foodDetails: new Map(),
//       };
      
//       cartRepository.findByUserIdWithDetails.mockResolvedValue(cartWithDetails);

//       await expect(service.createFromCart('user-1', {})).rejects.toThrow(
//         NotFoundException,
//       );
//       await expect(service.createFromCart('user-1', {})).rejects.toThrow(
//         'Cart is empty',
//       );
//     });

//     it('should throw NotFoundException if cart does not exist', async () => {
//       cartRepository.findByUserIdWithDetails.mockResolvedValue(null);

//       await expect(service.createFromCart('user-1', {})).rejects.toThrow(
//         NotFoundException,
//       );
//     });

//     it('should throw NotFoundException if some items are unavailable', async () => {
//       const cartWithDetails = {
//         cart: mockCart,
//         foodDetails: new Map([
//           ['food-1', { name: 'Pizza', price: 15.99, isAvailable: false }],
//         ]),
//       };

//       cartRepository.findByUserIdWithDetails.mockResolvedValue(cartWithDetails);

//       await expect(service.createFromCart('user-1', {})).rejects.toThrow(
//         NotFoundException,
//       );
//       await expect(service.createFromCart('user-1', {})).rejects.toThrow(
//         'Some food items are not available',
//       );
//     });

//     it('should not clear cart if clearCart is false', async () => {
//       const cartWithDetails = {
//         cart: mockCart,
//         foodDetails: new Map([
//           ['food-1', { name: 'Pizza', price: 15.99, isAvailable: true }],
//         ]),
//       };
      
//       cartRepository.findByUserIdWithDetails.mockResolvedValue(cartWithDetails);
//       orderRepository.create.mockResolvedValue(mockOrder);

//       await service.createFromCart('user-1', { clearCart: false });
      
//       expect(cartRepository.clearCart).not.toHaveBeenCalled();
//     });
//   });

//   describe('findAll', () => {
//     it('should return paginated orders', async () => {
//       const orders = [mockOrder];
//       orderRepository.findAll.mockResolvedValue({
//         orders,
//         total: 1,
//       });

//       const result = await service.findAll(1, 10);

//       expect(orderRepository.findAll).toHaveBeenCalledWith(1, 10, {});
//       expect(result).toEqual({
//         orders,
//         pagination: {
//           total: 1,
//           page: 1,
//           limit: 10,
//           totalPages: 1,
//         },
//       });
//     });

//     it('should filter orders by status', async () => {
//       const orders = [mockOrder];
//       orderRepository.findAll.mockResolvedValue({
//         orders,
//         total: 1,
//       });

//       await service.findAll(1, 10, { status: OrderStatus.PENDING });

//       expect(orderRepository.findAll).toHaveBeenCalledWith(1, 10, {
//         status: OrderStatus.PENDING,
//       });
//     });

//     it('should calculate pagination correctly', async () => {
//       orderRepository.findAll.mockResolvedValue({
//         orders: [],
//         total: 25,
//       });

//       const result = await service.findAll(2, 10);

//       expect(orderRepository.findAll).toHaveBeenCalledWith(2, 10, {});
//       expect(result.pagination).toEqual({
//         total: 25,
//         page: 2,
//         limit: 10,
//         totalPages: 3,
//       });
//     });
//   });

//   describe('findOne', () => {
//     it('should return an order by id', async () => {
//       orderRepository.findById.mockResolvedValue(mockOrder);

//       const result = await service.findOne('order-1');

//       expect(orderRepository.findById).toHaveBeenCalledWith('order-1');
//       expect(result).toEqual(mockOrder);
//     });

//     it('should throw NotFoundException if order not found', async () => {
//       orderRepository.findById.mockResolvedValue(null);

//       await expect(service.findOne('non-existent')).rejects.toThrow(
//         NotFoundException,
//       );
//       await expect(service.findOne('non-existent')).rejects.toThrow(
//         MESSAGES.GENERAL.NOT_FOUND,
//       );
//     });
//   });

//   describe('updateStatus', () => {
//     it('should successfully update order status', async () => {
//       const updatedOrder = new Order({
//         ...mockOrder,
//         status: OrderStatus.PREPARING,
//       });
//       orderRepository.findById.mockResolvedValue(mockOrder);
//       orderRepository.updateStatus.mockResolvedValue(updatedOrder);

//       const result = await service.updateStatus('order-1', {
//         status: OrderStatus.PREPARING,
//       });

//       expect(orderRepository.updateStatus).toHaveBeenCalledWith('order-1', OrderStatus.PREPARING);
//       expect(result).toEqual(updatedOrder);
//     });

//     it('should throw NotFoundException if order not found', async () => {
//       orderRepository.findById.mockResolvedValue(null);

//       await expect(
//         service.updateStatus('non-existent', { status: OrderStatus.PREPARING }),
//       ).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('remove', () => {
//     it('should successfully delete an order', async () => {
//       orderRepository.findById.mockResolvedValue(mockOrder);
//       orderRepository.delete.mockResolvedValue(undefined);

//       const result = await service.remove('order-1');

//       expect(orderRepository.delete).toHaveBeenCalledWith('order-1');
//       expect(result).toEqual({ message: 'Order deleted successfully' });
//     });

//     it('should throw NotFoundException if order not found', async () => {
//       orderRepository.findById.mockResolvedValue(null);

//       await expect(service.remove('non-existent')).rejects.toThrow(
//         NotFoundException,
//       );
//     });
//   });
// });
