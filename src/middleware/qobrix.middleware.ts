import { Inject, Injectable, NestMiddleware, forwardRef } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';

import { ConfigService } from 'common/configs/config.service';

@Injectable()
export class QobrixProxyMiddleware implements NestMiddleware {
  private qobrixProxy: RequestHandler;

  constructor(
    @Inject(forwardRef(() => ConfigService))
    private config: ConfigService,
  ) {
    const targetUrl = this.config.get('QOBRIX_BASE_URL');
    this.qobrixProxy = createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      pathRewrite: {
        '^/qobrix-proxy': '',
      },
      secure: false,
    });

    this.use = this.use.bind(this);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    this.qobrixProxy(req, res, next);
  }
}