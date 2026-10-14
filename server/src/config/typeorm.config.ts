import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const createTypeOrmConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',

  host: config.getOrThrow<string>('DB_HOST'),
  port: Number(config.get<string>('DB_PORT') ?? 5432),
  username: config.getOrThrow<string>('DB_USERNAME'),
  password: config.getOrThrow<string>('DB_PASSWORD'),
  database: config.getOrThrow<string>('DB_DATABASE'),

  autoLoadEntities: true,
  synchronize: false,

  logging: config.get<string>('NODE_ENV') === 'development',
});
