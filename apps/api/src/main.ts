import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  ClassSerializerInterceptor,
  HttpStatus,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IValidationErrors } from '@common/models';
import { ResponseManager } from '@common/helpers';

const PORT = process.env.PORT;

process.env.TZ = 'Etc/UTC';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors();
  app.disable('x-powered-by');
  // automatically serialize data. Use class-transformer library
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // automatically validate incoming request data using decorators and the class-validator library
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      stopAtFirstError: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const errorResponce: IValidationErrors[] = [];
        errors.forEach((e) => {
          if (e.constraints) {
            errorResponce.push(...ResponseManager.validationHandler([e]));
          }
          if (e.children) {
            errorResponce.push(
              ...ResponseManager.validationHandler(
                e.children,
                e.property?.toLowerCase(),
              ),
            );
          }
        });
        throw ResponseManager.buildError(
          { errors: errorResponce, message: 'ValidationError' },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      },
    }),
  );

  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Trivia Duel APIs')
      .setDescription('The Trivia Duel API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(PORT, () => {
    console.log(`API: ${PORT}`);
  });
}

bootstrap();
