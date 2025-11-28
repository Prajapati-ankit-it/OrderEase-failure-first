import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database';
import { SignUpDto, LoginDto } from './dto';
import { hashPassword, comparePassword } from '../utils';
import { MESSAGES, Role } from '../constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async signUp(signUpDto: SignUpDto) {
    const { email, password, name, role } = signUpDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(MESSAGES.AUTH.USER_EXISTS);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role ?? Role.USER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Authenticate user and return tokens
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessExpiresIn =
      this.configService.get<string>('jwt.expiresIn') ?? '7d';
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') ?? '30d';

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: accessExpiresIn as
        | `${number}d`
        | `${number}h`
        | `${number}m`
        | `${number}s`,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: refreshExpiresIn as
        | `${number}d`
        | `${number}h`
        | `${number}m`
        | `${number}s`,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        role: string;
      }>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException(MESSAGES.AUTH.USER_NOT_FOUND);
      }

      const tokens = this.generateTokens(user.id, user.email, user.role);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException(MESSAGES.AUTH.TOKEN_INVALID);
    }
  }
}
