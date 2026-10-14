import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { UserRole } from '../users/enums/role.enum';
import { RefreshSession } from './entities/refresh-session.entity';
import { getTokenTtl, getTokenTtlMilliseconds } from './auth-token.config';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

interface RefreshTokenPayload {
  sub: string;
  sid: string;
  type: 'refresh';
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshSession)
    private readonly refreshSessionRepository: Repository<RefreshSession>,
  ) {}

  // VALIDATE LOGIN CREDENTIALS
  async validateUser(email: string, password: string): Promise<AuthUser> {
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  // SIGNUP
  async signup(signupDto: SignupDto) {
    return this.usersService.create(signupDto);
  }

  // LOGIN
  async login(user: AuthUser): Promise<TokenPair> {
    return this.createTokenPair(user);
  }

  // REFRESH AND ROTATE TOKENS
  async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyRefreshToken(refreshToken);

    const session = await this.refreshSessionRepository.findOne({
      where: {
        id: payload.sid,
        userId: payload.sub,
      },
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        expiresAt: true,
        revokedAt: true,
      },
    });

    if (
      !session ||
      session.expiresAt <= new Date() ||
      !(await bcrypt.compare(refreshToken, session.tokenHash))
    ) {
      await this.revokeAllUserSessions(payload.sub);

      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.revokedAt) {
      await this.revokeAllUserSessions(payload.sub);

      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);

    const nextSessionId = randomUUID();

    const revoked = await this.refreshSessionRepository.update(
      {
        id: session.id,
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
        replacedById: nextSessionId,
      },
    );

    if (revoked.affected !== 1) {
      await this.revokeAllUserSessions(payload.sub);

      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.createTokenPair(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      nextSessionId,
    );
  }

  // LOGOUT
  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = await this.verifyRefreshToken(refreshToken);

      await this.refreshSessionRepository.update(
        {
          id: payload.sid,
          userId: payload.sub,
          revokedAt: IsNull(),
        },
        {
          revokedAt: new Date(),
        },
      );
    } catch {
      // Logout remains successful if the token is invalid
      // or the session has already expired.
    }
  }

  // CREATE ACCESS TOKEN AND REFRESH TOKEN
  private async createTokenPair(
    user: AuthUser,
    sessionId = randomUUID(),
  ): Promise<TokenPair> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshTtl = this.getRefreshTokenTtl();

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        sid: sessionId,
        type: 'refresh',
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: getTokenTtl(refreshTtl),
      },
    );

    await this.refreshSessionRepository.save(
      this.refreshSessionRepository.create({
        id: sessionId,
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, 12),
        expiresAt: new Date(Date.now() + getTokenTtlMilliseconds(refreshTtl)),
        revokedAt: null,
        replacedById: null,
      }),
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  // VERIFY REFRESH TOKEN SIGNATURE AND PAYLOAD
  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );

      if (
        payload.type !== 'refresh' ||
        typeof payload.sub !== 'string' ||
        typeof payload.sid !== 'string'
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // REVOKE ALL ACTIVE SESSIONS FOR A USER
  private async revokeAllUserSessions(userId: string): Promise<void> {
    await this.refreshSessionRepository.update(
      {
        userId,
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      },
    );
  }

  // READ REFRESH TOKEN TTL FROM CONFIGURATION
  private getRefreshTokenTtl(): string {
    return this.configService.getOrThrow<string>('JWT_REFRESH_TTL');
  }

  // GET USER PROFILE
  getProfile(userId: string) {
    return this.usersService.findById(userId);
  }
}
