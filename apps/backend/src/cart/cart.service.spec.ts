// import { Test, TestingModule } from '@nestjs/testing';
// import { NotFoundException, BadRequestException } from '@nestjs/common';
// import { CartService } from './cart.service';
// import { PrismaService } from '../database';
// import { createMockPrismaService } from '../test-utils';

// describe('CartService', () => {
//   let service: CartService;
//   let prismaService: ReturnType<typeof createMockPrismaService>;

//   const mockFood = {
//     id: 'food-1',
//     name: 'Pizza',
//     description: 'Delicious pizza',
//     price: 15.99,
//     category: 'Italian',
//     image: 'pizza.jpg',
//     isAvailable: true,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   };

//   const mockCart = {
//     id: 'cart-1',
//     userId: 'user-1',
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     cartItems: [
//       {
//         id: 'cart-item-1',
//         cartId: 'cart-1',
//         foodId: 'food-1',
//         quantity: 2,
//         food: mockFood,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     ],
//   };

//   const mockCartItem = {
//     id: 'cart-item-1',
//     cartId: 'cart-1',
//     foodId: 'food-1',
//     quantity: 2,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   };

//   beforeEach(async () => {
//     prismaService = createMockPrismaService();

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         CartService,
//         { provide: PrismaService, useValue: prismaService },
//       ],
//     }).compile();

//     service = module.get<CartService>(CartService);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('getCart', () => {
//     it('should return existing cart with items', async () => {
//       prismaService.cart.findUnique.mockResolvedValue(mockCart);

//       const result = await service.getCart('user-1');

//       expect(prismaService.cart.findUnique).toHaveBeenCalledWith({
//         where: { userId: 'user-1' },
//         include: {
//           cartItems: {
//             include: {
//               food: true,
//             },
//           },
//         },
//       });
//       expect(result).toEqual({
//         ...mockCart,
//         totalPrice: 31.98, // 15.99 * 2
//         itemCount: 1,
//       });
//     });

//     it('should create a new cart if it does not exist', async () => {
//       const emptyCart = {
//         id: 'new-cart-1',
//         userId: 'user-1',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         cartItems: [],
//       };

//       prismaService.cart.findUnique.mockResolvedValueOnce(null);
//       prismaService.cart.create.mockResolvedValue(emptyCart);

//       const result = await service.getCart('user-1');

//       expect(prismaService.cart.create).toHaveBeenCalledWith({
//         data: { userId: 'user-1' },
//         include: {
//           cartItems: {
//             include: {
//               food: true,
//             },
//           },
//         },
//       });
//       expect(result.totalPrice).toBe(0);
//       expect(result.itemCount).toBe(0);
//     });

//     it('should calculate total price correctly for multiple items', async () => {
//       const cartWithMultipleItems = {
//         ...mockCart,
//         cartItems: [
//           {
//             ...mockCart.cartItems[0],
//             quantity: 2,
//           },
//           {
//             id: 'cart-item-2',
//             cartId: 'cart-1',
//             foodId: 'food-2',
//             quantity: 3,
//             food: { ...mockFood, id: 'food-2', price: 9.99 },
//             createdAt: new Date(),
//             updatedAt: new Date(),
//           },
//         ],
//       };

//       prismaService.cart.findUnique.mockResolvedValue(cartWithMultipleItems);

//       const result = await service.getCart('user-1');

//       expect(result.totalPrice).toBe(61.95); // (15.99 * 2) + (9.99 * 3)
//       expect(result.itemCount).toBe(2);
//     });
//   });

//   describe('addToCart', () => {
//     const addToCartDto = {
//       foodId: 'food-1',
//       quantity: 2,
//     };

//     it('should add a new item to cart', async () => {
//       prismaService.food.findUnique.mockResolvedValue(mockFood);
//       prismaService.cart.findUnique.mockResolvedValueOnce({
//         id: 'cart-1',
//         userId: 'user-1',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });
//       prismaService.cartItem.findUnique.mockResolvedValue(null);
//       prismaService.cartItem.create.mockResolvedValue(mockCartItem);
//       prismaService.cart.findUnique.mockResolvedValueOnce(mockCart);

//       const result = await service.addToCart('user-1', addToCartDto);

//       expect(prismaService.food.findUnique).toHaveBeenCalledWith({
//         where: { id: 'food-1' },
//       });
//       expect(prismaService.cartItem.create).toHaveBeenCalledWith({
//         data: {
//           cartId: 'cart-1',
//           foodId: 'food-1',
//           quantity: 2,
//         },
//       });
//       expect(result).toBeDefined();
//     });

//     it('should update quantity if item already exists in cart', async () => {
//       prismaService.food.findUnique.mockResolvedValue(mockFood);
//       prismaService.cart.findUnique.mockResolvedValueOnce({
//         id: 'cart-1',
//         userId: 'user-1',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });
//       prismaService.cartItem.findUnique.mockResolvedValue(mockCartItem);
//       prismaService.cartItem.update.mockResolvedValue({
//         ...mockCartItem,
//         quantity: 4,
//       });
//       prismaService.cart.findUnique.mockResolvedValueOnce(mockCart);

//       await service.addToCart('user-1', addToCartDto);

//       expect(prismaService.cartItem.update).toHaveBeenCalledWith({
//         where: { id: 'cart-item-1' },
//         data: { quantity: 4 }, // existing 2 + new 2
//       });
//     });

//     it('should create a new cart if it does not exist', async () => {
//       const newCart = {
//         id: 'new-cart-1',
//         userId: 'user-1',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       prismaService.food.findUnique.mockResolvedValue(mockFood);
//       prismaService.cart.findUnique.mockResolvedValueOnce(null);
//       prismaService.cart.create.mockResolvedValue(newCart);
//       prismaService.cartItem.findUnique.mockResolvedValue(null);
//       prismaService.cartItem.create.mockResolvedValue(mockCartItem);
//       prismaService.cart.findUnique.mockResolvedValueOnce(mockCart);

//       await service.addToCart('user-1', addToCartDto);

//       expect(prismaService.cart.create).toHaveBeenCalledWith({
//         data: { userId: 'user-1' },
//       });
//     });

//     it('should throw NotFoundException if food item not found', async () => {
//       prismaService.food.findUnique.mockResolvedValue(null);

//       await expect(service.addToCart('user-1', addToCartDto)).rejects.toThrow(
//         NotFoundException,
//       );
//       await expect(service.addToCart('user-1', addToCartDto)).rejects.toThrow(
//         'Food item not found',
//       );
//     });

//     it('should throw BadRequestException if food item is not available', async () => {
//       prismaService.food.findUnique.mockResolvedValue({
//         ...mockFood,
//         isAvailable: false,
//       });

//       await expect(service.addToCart('user-1', addToCartDto)).rejects.toThrow(
//         BadRequestException,
//       );
//       await expect(service.addToCart('user-1', addToCartDto)).rejects.toThrow(
//         'Food item is not available',
//       );
//     });
//   });

//   describe('updateCartItem', () => {
//     const updateCartItemDto = {
//       quantity: 5,
//     };

//     it('should update cart item quantity', async () => {
//       prismaService.cart.findUnique
//         .mockResolvedValueOnce({
//           id: 'cart-1',
//           userId: 'user-1',
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         })
//         .mockResolvedValueOnce(mockCart);
//       prismaService.cartItem.findUnique.mockResolvedValue(mockCartItem);
//       prismaService.cartItem.update.mockResolvedValue({
//         ...mockCartItem,
//         quantity: 5,
//       });

//       await service.updateCartItem('user-1', 'cart-item-1', updateCartItemDto);

//       expect(prismaService.cartItem.update).toHaveBeenCalledWith({
//         where: { id: 'cart-item-1' },
//         data: { quantity: 5 },
//       });
//     });

//     it('should remove item if quantity is 0', async () => {
//       prismaService.cart.findUnique
//         .mockResolvedValueOnce({
//           id: 'cart-1',
//           userId: 'user-1',
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         })
//         .mockResolvedValueOnce(mockCart);
//       prismaService.cartItem.findUnique.mockResolvedValue(mockCartItem);
//       prismaService.cartItem.delete.mockResolvedValue(mockCartItem);

//       await service.updateCartItem('user-1', 'cart-item-1', { quantity: 0 });

//       expect(prismaService.cartItem.delete).toHaveBeenCalledWith({
//         where: { id: 'cart-item-1' },
//       });
//     });

//     it('should throw NotFoundException if cart not found', async () => {
//       prismaService.cart.findUnique.mockResolvedValue(null);

//       await expect(
//         service.updateCartItem('user-1', 'cart-item-1', updateCartItemDto),
//       ).rejects.toThrow(NotFoundException);
//       await expect(
//         service.updateCartItem('user-1', 'cart-item-1', updateCartItemDto),
//       ).rejects.toThrow('Cart not found');
//     });

//     it('should throw NotFoundException if cart item not found', async () => {
//       prismaService.cart.findUnique.mockResolvedValue({
//         id: 'cart-1',
//         userId: 'user-1',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });
//       prismaService.cartItem.findUnique.mockResolvedValue(null);

//       await expect(
//         service.updateCartItem('user-1', 'cart-item-1', updateCartItemDto),
//       ).rejects.toThrow(NotFoundException);
//       await expect(
//         service.updateCartItem('user-1', 'cart-item-1', updateCartItemDto),
//       ).rejects.toThrow('Cart item not found');
//     });

//     it('should throw NotFoundException if cart item does not belong to user cart', async () => {
//       prismaService.cart.findUnique.mockResolvedValue({
//         id: 'cart-1',
//         userId: 'user-1',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });
//       prismaService.cartItem.findUnique.mockResolvedValue({
//         ...mockCartItem,
//         cartId: 'different-cart-id',
//       });

//       await expect(
//         service.updateCartItem('user-1', 'cart-item-1', updateCartItemDto),
//       ).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('removeFromCart', () => {
//     it('should successfully remove item from cart', async () => {
//       prismaService.cart.findUnique
//         .mockResolvedValueOnce({
//           id: 'cart-1',
//           userId: 'user-1',
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         })
//         .mockResolvedValueOnce(mockCart);
//       prismaService.cartItem.findUnique.mockResolvedValue(mockCartItem);
//       prismaService.cartItem.delete.mockResolvedValue(mockCartItem);

//       await service.removeFromCart('user-1', 'cart-item-1');

//       expect(prismaService.cartItem.delete).toHaveBeenCalledWith({
//         where: { id: 'cart-item-1' },
//       });
//     });

//     it('should throw NotFoundException if cart not found', async () => {
//       prismaService.cart.findUnique.mockResolvedValue(null);

//       await expect(
//         service.removeFromCart('user-1', 'cart-item-1'),
//       ).rejects.toThrow(NotFoundException);
//     });

//     it('should throw NotFoundException if cart item not found', async () => {
//       prismaService.cart.findUnique.mockResolvedValue({
//         id: 'cart-1',
//         userId: 'user-1',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });
//       prismaService.cartItem.findUnique.mockResolvedValue(null);

//       await expect(
//         service.removeFromCart('user-1', 'cart-item-1'),
//       ).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('clearCart', () => {
//     it('should successfully clear all items from cart', async () => {
//       prismaService.cart.findUnique
//         .mockResolvedValueOnce({
//           id: 'cart-1',
//           userId: 'user-1',
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         })
//         .mockResolvedValueOnce({
//           ...mockCart,
//           cartItems: [],
//         });
//       prismaService.cartItem.deleteMany.mockResolvedValue({ count: 2 });

//       await service.clearCart('user-1');

//       expect(prismaService.cartItem.deleteMany).toHaveBeenCalledWith({
//         where: { cartId: 'cart-1' },
//       });
//     });

//     it('should throw NotFoundException if cart not found', async () => {
//       prismaService.cart.findUnique.mockResolvedValue(null);

//       await expect(service.clearCart('user-1')).rejects.toThrow(
//         NotFoundException,
//       );
//       await expect(service.clearCart('user-1')).rejects.toThrow(
//         'Cart not found',
//       );
//     });
//   });
// });
