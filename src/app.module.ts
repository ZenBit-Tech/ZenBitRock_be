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
import { QobrixProxyMiddleware } from './middleware/qobrix.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { EmailModule } from './modules/email/email.module';
import { UserModule } from './modules/user/user.module';
import { VerificationModule } from './modules/verification/verification.module';
import { LeadModule } from './modules/lead/lead.module';
import { EventsModule } from './modules/events/events.module';
import { ChatModule } from './modules/chat/chat.module';
import { DatabasePingMiddleware } from './middleware/database-ping.middleware';
import { AuthController } from './modules/auth/auth.controller';
import { UserController } from './modules/user/user.controller';
import { ContentModule } from './modules/content/content.module';
import { ChatController } from './modules/chat/conrollers/chat.controller';
import { MessageController } from './modules/chat/conrollers/message.controller';
import { ContentController } from './modules/content/controllers/content.controller';
import { EmailController } from './modules/email/email.controller';
import { LeadController } from './modules/lead/lead.controller';
import { VerificationController } from './modules/verification/verification.controller';
import { NotificationModule } from './modules/notification/notification.module';

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
    NotificationModule,
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
        limit: 15,
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
      .forRoutes(
        AuthController,
        UserController,
        ChatController,
        MessageController,
        ContentController,
        EmailController,
        LeadController,
        VerificationController,
      );
  }
}
