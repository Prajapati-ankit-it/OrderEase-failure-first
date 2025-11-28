import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsOptional()
  email?: string;
}

export class UpdatePasswordDto {
  @IsString()
  @MinLength(6, { message: 'Current password is required' })
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword: string;
}
