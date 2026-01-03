import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Role } from '../../constants';

export class SignUpDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Role, { message: 'Role must be either ADMIN or USER' })
  @IsOptional()
  role?: Role;
}
