import { Controller, All, Req, Res, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // Route auth requests to backend
  @All('auth/*')
  async authProxy(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res, 'backend');
  }

  // Route user requests to backend
  @All('user/*')
  async userProxy(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res, 'backend');
  }

  // Route admin requests to backend
  @All('admin/*')
  async adminProxy(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res, 'backend');
  }

  // Route food requests to backend
  @All('food/*')
  async foodProxy(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res, 'backend');
  }

  // Route public requests to backend
  @All('public/*')
  async publicProxy(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res, 'backend');
  }

  // Route health requests to backend
  @All('health/*')
  async healthProxy(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res, 'backend');
  }

  // Route order requests to order service
  @All('order/*')
  async orderProxy(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res, 'order-service');
  }

  // Route cart requests to order service
  @All('cart/*')
  async cartProxy(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res, 'order-service');
  }

  private async proxy(req: Request, res: Response, service: 'backend' | 'order-service') {
    try {
      const path = req.url;
      const method = req.method;
      const data = method === 'GET' ? req.query : req.body;
      const headers = req.headers;

      let result;
      if (service === 'backend') {
        result = await this.proxyService.forwardToBackend(path, method, data, headers);
      } else {
        result = await this.proxyService.forwardToOrderService(path, method, data, headers);
      }

      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Internal server error';
      return res.status(statusCode).json({
        success: false,
        message,
        error: error.error || 'PROXY_ERROR',
      });
    }
  }
}
