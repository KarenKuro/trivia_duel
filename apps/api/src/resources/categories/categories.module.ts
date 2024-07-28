import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoryEntity, UserEntity } from '@common/database/entities';
import { UserModule } from '@api-resources/user';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([UserEntity, CategoryEntity]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(`JWT_CONFIG.secret`),
        signOptions: {
          expiresIn: configService.get<string>(`JWT_CONFIG.expiresIn`),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
