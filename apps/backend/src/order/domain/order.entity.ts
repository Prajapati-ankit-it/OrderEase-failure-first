/**
 * Order Domain Entity
 * Pure domain object with no framework dependencies
 */

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  readonly foodId: string;
  readonly quantity: number;
  readonly price: number;
}

export interface OrderProps {
  readonly id?: string;
  readonly userId: string;
  readonly items: OrderItem[];
  readonly status?: OrderStatus;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

/**
 * Order Entity - Contains core business state
 * No framework dependencies, pure domain logic
 */
export class Order {
  private readonly _id?: string;
  private readonly _userId: string;
  private readonly _items: OrderItem[];
  private _status: OrderStatus;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(props: OrderProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._items = props.items;
    this._status = props.status || OrderStatus.PENDING;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string | undefined {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get items(): OrderItem[] {
    return this._items;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  /**
   * Calculate total price of the order
   * Pure business logic - no side effects
   */
  calculateTotal(): number {
    return this._items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }

  /**
   * Check if order can be cancelled
   * Business rule: only pending or preparing orders can be cancelled
   */
  canBeCancelled(): boolean {
    return (
      this._status === OrderStatus.PENDING ||
      this._status === OrderStatus.PREPARING
    );
  }

  /**
   * Check if order is in final state
   */
  isFinal(): boolean {
    return (
      this._status === OrderStatus.DELIVERED ||
      this._status === OrderStatus.CANCELLED
    );
  }
}