/**
 * Orders API Integration Tests
 * Tests order management flow integration with backend
 */

import ordersApi from './orders.api';
import httpClient from './httpClient';

// Mock httpClient
jest.mock('./httpClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Orders API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOrders', () => {
    it('should handle paginated response from backend', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Success',
          data: {
            orders: [
              {
                _id: '123',
                userId: 'user1',
                status: 'PENDING',
                totalPrice: 100,
                items: [],
                createdAt: '2024-01-01T00:00:00.000Z',
              },
            ],
            pagination: {
              total: 1,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          },
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await ordersApi.getAllOrders({ page: 1, limit: 10 });

      expect(httpClient.get).toHaveBeenCalledWith('/order', {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual({
        orders: mockResponse.data.data.orders,
        pagination: mockResponse.data.data.pagination,
      });
    });

    it('should pass status filter parameter', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            orders: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
          },
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      await ordersApi.getAllOrders({ page: 1, limit: 10, status: 'PENDING' });

      expect(httpClient.get).toHaveBeenCalledWith('/order', {
        params: { page: 1, limit: 10, status: 'PENDING' },
      });
    });

    it('should handle empty orders list', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            orders: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
          },
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await ordersApi.getAllOrders();

      expect(result.orders).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('createOrder', () => {
    it('should unwrap backend response', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Order created successfully',
          data: {
            _id: '123',
            userId: 'user1',
            status: 'PENDING',
            totalPrice: 100,
            items: [{ foodId: 'food1', quantity: 2, price: 50 }],
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const orderData = {
        items: [{ foodId: 'food1', quantity: 2 }],
      };

      const result = await ordersApi.createOrder(orderData);

      expect(httpClient.post).toHaveBeenCalledWith('/order', orderData);
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('updateOrderStatus', () => {
    it('should send status update to backend', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Order status updated',
          data: {
            _id: '123',
            status: 'PREPARING',
          },
        },
      };

      httpClient.put.mockResolvedValue(mockResponse);

      const result = await ordersApi.updateOrderStatus('123', 'PREPARING');

      expect(httpClient.put).toHaveBeenCalledWith('/order/123/status', {
        status: 'PREPARING',
      });
      expect(result.status).toBe('PREPARING');
    });
  });

  describe('getOrderById', () => {
    it('should fetch single order by ID', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            _id: '123',
            userId: 'user1',
            status: 'PENDING',
            totalPrice: 100,
            items: [],
          },
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await ordersApi.getOrderById('123');

      expect(httpClient.get).toHaveBeenCalledWith('/order/123');
      expect(result._id).toBe('123');
    });
  });

  describe('deleteOrder', () => {
    it('should delete order by ID', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Order deleted successfully',
        },
      };

      httpClient.delete.mockResolvedValue(mockResponse);

      const result = await ordersApi.deleteOrder('123');

      expect(httpClient.delete).toHaveBeenCalledWith('/order/123');
      expect(result.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const mockError = new Error('Network error');
      httpClient.get.mockRejectedValue(mockError);

      await expect(ordersApi.getAllOrders()).rejects.toThrow('Network error');
    });

    it('should handle API errors', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Unauthorized',
          },
        },
      };
      httpClient.get.mockRejectedValue(mockError);

      await expect(ordersApi.getAllOrders()).rejects.toEqual(mockError);
    });
  });
});
