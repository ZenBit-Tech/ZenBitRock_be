/* eslint-disable typesafe/promise-catch */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ConfigService } from './common/configs/config.service';
import { QobrixProxyMiddleware } from './middleware/qobrix.middleware';

async function bootstrap(): Promise<void> {
  try {
    const app = await NestFactory.create(AppModule);

    const pipe = new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    });

    const config = new DocumentBuilder()
      .setTitle('ZenbitRock')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    document.servers = [{ url: '/api/v1' }];
    SwaggerModule.setup('api', app, document);

    const qobrixProxyMiddleware = new QobrixProxyMiddleware(
      new ConfigService(),
    );
    

    

    app.setGlobalPrefix('/api/v1');
    app.useGlobalPipes(pipe);
    app.enableCors();
    app.use('/qobrix-proxy', qobrixProxyMiddleware.use);
    console.log('Listening on port', process.env.APP_PORT);
    await app.listen(process.env.APP_PORT);
  } catch (error) {
    throw error;
  }
}

bootstrap();
