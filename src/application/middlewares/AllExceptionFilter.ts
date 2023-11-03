import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();
      const responseBody = exception.getResponse();
      response.status(httpStatus).json(responseBody);
    } else {
      const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      const message = 'Internal Server Error';
      const responseBody = {
        statusCode: httpStatus,
        message,
      };
      response.status(httpStatus).json(responseBody);
    }
  }
}
