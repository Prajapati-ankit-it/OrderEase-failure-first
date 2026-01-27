// /**
//  * Order Repository Interface
//  * Defines contract for order persistence without implementation details
//  * Domain layer can depend on this interface without knowing about Prisma
//  */

// import { Order } from '../domain/order.entity';

// export interface OrderListFilter {
//   status?: string;
//   userId?: string;
// }

// export interface OrderListResult {
//   orders: Order[];
//   total: number;
// }

// export interface IOrderRepository {
//   /**
//    * Create a new order
//    */
//   create(order: Order): Promise<Order>;

//   /**
//    * Find order by ID
//    */
//   findById(id: string): Promise<Order | null>;

//   /**
//    * Find orders with pagination and filters
//    */
//   findAll(
//     page: number,
//     limit: number,
//     filter?: OrderListFilter,
//   ): Promise<OrderListResult>;

//   /**
//    * Update order status
//    */
//   updateStatus(id: string, status: string): Promise<Order>;

//   /**
//    * Delete order by ID
//    */
//   delete(id: string): Promise<void>;
// }

// export const ORDER_REPOSITORY = Symbol('IOrderRepository');
