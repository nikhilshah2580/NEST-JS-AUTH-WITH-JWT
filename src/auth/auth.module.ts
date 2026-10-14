import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { RefreshSession } from './entities/refresh-session.entity';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RolesGuard } from './guards/roles.guard';
import { getTokenTtl } from './auth-token.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshSession]),

    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const accessTokenTtl =
          configService.getOrThrow<string>('JWT_ACCESS_TTL');
        const refreshTokenTtl =
          configService.getOrThrow<string>('JWT_REFRESH_TTL');

        getTokenTtl(accessTokenTtl);
        getTokenTtl(refreshTokenTtl);
        configService.getOrThrow<string>('JWT_ACCESS_SECRET');
        configService.getOrThrow<string>('JWT_REFRESH_SECRET');

        return {
          secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          signOptions: { expiresIn: getTokenTtl(accessTokenTtl) },
        };
      },
    }),

    UsersModule,
  ],

  controllers: [AuthController],

  providers: [AuthService, LocalStrategy, JwtStrategy, RolesGuard],

  exports: [AuthService],
})
export class AuthModule {}
