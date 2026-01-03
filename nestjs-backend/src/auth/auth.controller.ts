import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, LoginDto } from './dto';
import { MESSAGES } from '../constants';
import { successResponse } from '../utils';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * User registration endpoint
   * POST /auth/signup
   */
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    const result = await this.authService.signUp(signUpDto);
    return successResponse(MESSAGES.AUTH.SIGNUP_SUCCESS, result);
  }

  /**
   * User login endpoint
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return successResponse(MESSAGES.AUTH.LOGIN_SUCCESS, result);
  }

  /**
   * Token refresh endpoint
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    const result = await this.authService.refreshToken(refreshToken);
    return successResponse(MESSAGES.AUTH.LOGIN_SUCCESS, result);
  }
}
