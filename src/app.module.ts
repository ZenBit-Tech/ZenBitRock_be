import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailerModule } from '@nestjs-modules/mailer';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './common/configs/config.module';
import { ConfigService } from './common/configs/config.service';
import { typeOrmAsyncConfig } from './common/configs/database/typeorm-config';
import { DatabasePingMiddleware } from './middleware/database-ping.middleware';
import { QobrixProxyMiddleware } from './middleware/qobrix.middleware';
import { AuthController } from './modules/auth/auth.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { ContentModule } from './modules/content/content.module';
import { EmailModule } from './modules/email/email.module';
import { EventsModule } from './modules/events/events.module';
import { LeadModule } from './modules/lead/lead.module';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { VerificationModule } from './modules/verification/verification.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ConfigModule,
    AuthModule,
    UserModule,
    EmailModule,
    VerificationModule,
    CloudinaryModule,
    LeadModule,
    EventsModule,
    ChatModule,
    ContentModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS'),
          },
        },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 7,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  // eslint-disable-next-line class-methods-use-this
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(QobrixProxyMiddleware).forRoutes('/qobrix-proxy/*');
    consumer
      .apply(DatabasePingMiddleware)
      .forRoutes(AuthController, UserController);
  }
}
