import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { getTokenTtlMilliseconds } from './auth-token.config';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './publicRoutes/public';
import { UserRole } from '../users/enums/role.enum';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

const REFRESH_TOKEN_COOKIE = 'refresh_token';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // SIGNUP
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  // LOGIN
  @Public()
  @ApiOperation({ summary: 'Login as a user' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() _dto: LoginDto,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.login(req.user);

    this.setRefreshTokenCookie(response, tokens.refreshToken);

    return this.withoutRefreshToken(tokens);
  }

  // REFRESH ACCESS TOKEN
  @Public()
  @ApiCookieAuth(REFRESH_TOKEN_COOKIE)
  @ApiOperation({
    summary: 'Rotate the refresh token and issue an access token',
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = this.getRefreshTokenFromRequest(request);
    const tokens = await this.authService.refresh(refreshToken);

    this.setRefreshTokenCookie(response, tokens.refreshToken);

    return this.withoutRefreshToken(tokens);
  }

  // PROFILE
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the logged-in user profile' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Req() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.id);
  }

  // LOGOUT
  @Public()
  @ApiCookieAuth(REFRESH_TOKEN_COOKIE)
  @ApiOperation({ summary: 'Revoke the current refresh session' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(this.getOptionalRefreshToken(request));

    response.clearCookie(REFRESH_TOKEN_COOKIE, this.cookieOptions());

    return {
      message: 'Logged out successfully.',
    };
  }

  // SET REFRESH TOKEN COOKIE
  private setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
  ): void {
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...this.cookieOptions(),
      maxAge: getTokenTtlMilliseconds(
        this.configService.getOrThrow<string>('JWT_REFRESH_TTL'),
      ),
    });
  }

  // COOKIE CONFIGURATION
  private cookieOptions() {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict' as const,
      path: '/api/auth',
    };
  }

  // NEVER RETURN THE REFRESH TOKEN IN THE RESPONSE BODY
  private withoutRefreshToken({
    refreshToken: _refreshToken,
    ...tokens
  }: {
    accessToken: string;
    refreshToken: string;
    tokenType: 'Bearer';
  }) {
    return tokens;
  }

  // REQUIRE REFRESH TOKEN
  private getRefreshTokenFromRequest(request: Request): string {
    const refreshToken = this.getOptionalRefreshToken(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    return refreshToken;
  }

  // READ REFRESH TOKEN FROM COOKIE HEADER
  private getOptionalRefreshToken(request: Request): string | undefined {
    const cookie = request.headers.cookie;

    if (!cookie) {
      return undefined;
    }

    return cookie
      .split(';')
      .map((item) => item.trim().split('='))
      .find(([name]) => name === REFRESH_TOKEN_COOKIE)
      ?.slice(1)
      .join('=');
  }
}
