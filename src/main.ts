/* eslint-disable typesafe/promise-catch */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  try {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('/api/v1');
    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    const config = new DocumentBuilder()
      .setTitle('ZenbitRock')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    app.enableCors();

    await app.listen(process.env.APP_PORT);
  } catch (error) {
    throw error;
  }
}

bootstrap();
