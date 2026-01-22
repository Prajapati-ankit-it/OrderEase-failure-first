import { IsEnum, IsOptional, IsString, IsEmail } from 'class-validator';
import { Role } from '@orderease/shared-contracts';

export class UpdateUserRoleDto {
  @IsEnum(Role, { message: 'Role must be either ADMIN or USER' })
  role!: Role;
}

export class AdminUpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsOptional()
  email?: string;

  @IsEnum(Role, { message: 'Role must be either ADMIN or USER' })
  @IsOptional()
  role?: Role;
}
