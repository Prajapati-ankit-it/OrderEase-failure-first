import {
  RequestContextMiddleware,
  RequestWithContext,
} from './request-context.middleware';
import { Response, NextFunction } from 'express';

describe('RequestContextMiddleware', () => {
  let middleware: RequestContextMiddleware;
  let mockRequest: Partial<RequestWithContext>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new RequestContextMiddleware();
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      setHeader: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should generate requestId when not provided', () => {
    middleware.use(
      mockRequest as RequestWithContext,
      mockResponse as Response,
      mockNext,
    );

    expect(mockRequest.requestId).toBeDefined();
    expect(typeof mockRequest.requestId).toBe('string');
    expect(mockRequest.requestId?.length).toBeGreaterThan(0);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'x-request-id',
      mockRequest.requestId,
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should use existing x-request-id from headers', () => {
    mockRequest.headers = { 'x-request-id': 'existing-id-123' };

    middleware.use(
      mockRequest as RequestWithContext,
      mockResponse as Response,
      mockNext,
    );

    expect(mockRequest.requestId).toBe('existing-id-123');
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'x-request-id',
      'existing-id-123',
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should generate different requestIds for different requests', () => {
    const request1: Partial<RequestWithContext> = { headers: {} };
    const request2: Partial<RequestWithContext> = { headers: {} };
    const response1: Partial<Response> = { setHeader: jest.fn() };
    const response2: Partial<Response> = { setHeader: jest.fn() };

    middleware.use(
      request1 as RequestWithContext,
      response1 as Response,
      mockNext,
    );
    middleware.use(
      request2 as RequestWithContext,
      response2 as Response,
      mockNext,
    );

    expect(request1.requestId).toBeDefined();
    expect(request2.requestId).toBeDefined();
    expect(request1.requestId).not.toBe(request2.requestId);
  });

  it('should call next middleware', () => {
    middleware.use(
      mockRequest as RequestWithContext,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
