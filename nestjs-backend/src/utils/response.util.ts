/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Create a success response
 */
export function successResponse<T>(message: string, data?: T): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Create an error response
 */
export function errorResponse(message: string, error?: string): ApiResponse {
  return {
    success: false,
    message,
    error,
  };
}
