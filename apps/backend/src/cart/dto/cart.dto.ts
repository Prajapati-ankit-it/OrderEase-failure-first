import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';

/**
 * DTO for adding item to cart
 */
export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  foodId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

/**
 * DTO for updating cart item quantity
 */
export class UpdateCartItemDto {
  @IsInt()
  @Min(0)
  quantity!: number;
}
