import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../domain';

export class CreateOrderItemDto {
  @IsString()
  foodId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

export class CreateOrderFromCartDto {
  @IsOptional()
  @IsBoolean()
  clearCart?: boolean;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  status!: OrderStatus;
}
