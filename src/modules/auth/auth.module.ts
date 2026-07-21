import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
      secret: configService.getOrThrow<string>('JWT_SECRET'),

      signOptions: {
        expiresIn: configService.getOrThrow<StringValue>('JWT_EXPIRES_IN'),
      },
    }),
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService],
})
export class AuthModule {}