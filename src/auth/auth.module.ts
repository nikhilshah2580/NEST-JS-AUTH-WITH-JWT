import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { StrategiesModule } from './strategies/strategies.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [StrategiesModule]
})
export class AuthModule {}
