/**
 * Cart Domain Entity
 */

export interface CartItemProps {
  readonly foodId: string;
  readonly quantity: number;
}

export interface CartProps {
  readonly id?: string;
  readonly userId: string;
  readonly items: CartItemProps[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class Cart {
  private readonly _id?: string;
  private readonly _userId: string;
  private readonly _items: CartItemProps[];
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  constructor(props: CartProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._items = props.items;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string | undefined {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get items(): CartItemProps[] {
    return this._items;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  isEmpty(): boolean {
    return this._items.length === 0;
  }
}
