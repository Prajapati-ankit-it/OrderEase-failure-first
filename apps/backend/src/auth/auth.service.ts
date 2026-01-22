import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignUpDto, LoginDto } from './dto';
import { hashPassword, comparePassword, parseJwtExpiration } from '../utils';
import { MESSAGES } from '@orderease/shared-contracts';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../user/infra/user.repository.interface';
import { User, UserRole } from '@orderease/shared-contracts';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async signUp(signUpDto: SignUpDto) {
    const { email, password, name, role } = signUpDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException(MESSAGES.AUTH.USER_EXISTS);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user domain object
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: (role ?? 'USER') as UserRole,
    });

    // Persist user
    const createdUser = await this.userRepository.create(user);

    // Generate tokens
    const tokens = this.generateTokens(
      createdUser.id!,
      createdUser.email,
      createdUser.role,
    );

    return {
      user: createdUser.toSafeUser(),
      ...tokens,
    };
  }

  /**
   * Authenticate user and return tokens
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id!, user.email, user.role);

    return {
      user: user.toSafeUser(),
      ...tokens,
    };
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessExpiresIn = parseJwtExpiration(
      this.configService.get<string>('jwt.expiresIn'),
      '7d',
    );
    const refreshExpiresIn = parseJwtExpiration(
      this.configService.get<string>('jwt.refreshExpiresIn'),
      '30d',
    );

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: accessExpiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: refreshExpiresIn,
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

      const user = await this.userRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException(MESSAGES.AUTH.USER_NOT_FOUND);
      }

      const tokens = this.generateTokens(user.id!, user.email, user.role);

      return {
        user: user.toSafeUser(),
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException(MESSAGES.AUTH.TOKEN_INVALID);
    }
  }
}
