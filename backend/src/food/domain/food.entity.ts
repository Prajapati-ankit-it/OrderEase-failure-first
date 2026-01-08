/**
 * Food Domain Entity
 * Pure domain object with no framework dependencies
 */

export interface FoodProps {
  readonly id?: string;
  readonly name: string;
  readonly description?: string;
  readonly price: number;
  readonly category: string;
  readonly image?: string;
  readonly isAvailable: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

/**
 * Food Entity - Contains core business state
 */
export class Food {
  private readonly _id?: string;
  private readonly _name: string;
  private readonly _description?: string;
  private readonly _price: number;
  private readonly _category: string;
  private readonly _image?: string;
  private readonly _isAvailable: boolean;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  constructor(props: FoodProps) {
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._price = props.price;
    this._category = props.category;
    this._image = props.image;
    this._isAvailable = props.isAvailable;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string | undefined {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get price(): number {
    return this._price;
  }

  get category(): string {
    return this._category;
  }

  get image(): string | undefined {
    return this._image;
  }

  get isAvailable(): boolean {
    return this._isAvailable;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }
}
