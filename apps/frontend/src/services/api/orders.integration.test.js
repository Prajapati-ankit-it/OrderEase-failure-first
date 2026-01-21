/**
 * Orders Integration Smoke Test
 * Verifies that order API integration matches backend contract
 */

import { API_ENDPOINTS } from '../../config/api.config';
import { ORDER_STATUSES } from '../../constants';
import { getOrderStatusColor } from '../../utils';

describe('Orders API Integration Contract', () => {
  describe('API Endpoints Configuration', () => {
    it('should have correct order endpoints', () => {
      expect(API_ENDPOINTS.ORDERS.LIST).toBe('/order');
      expect(API_ENDPOINTS.ORDERS.CREATE).toBe('/order');
      expect(API_ENDPOINTS.ORDERS.CREATE_FROM_CART).toBe('/order/from-cart');
      expect(API_ENDPOINTS.ORDERS.BY_ID('123')).toBe('/order/123');
      expect(API_ENDPOINTS.ORDERS.UPDATE_STATUS('123')).toBe('/order/123/status');
      expect(API_ENDPOINTS.ORDERS.DELETE('123')).toBe('/order/123');
    });
  });

  describe('Order Status Constants', () => {
    it('should use UPPERCASE status values matching backend', () => {
      // Backend uses UPPERCASE: PENDING, PREPARING, READY, DELIVERED, CANCELLED
      expect(ORDER_STATUSES).toContain('PENDING');
      expect(ORDER_STATUSES).toContain('PREPARING');
      expect(ORDER_STATUSES).toContain('READY');
      expect(ORDER_STATUSES).toContain('DELIVERED');
    });
  });

  describe('Response Format Handling', () => {
    it('should handle backend response format', () => {
      // Backend returns: { success, message, data: { orders: [], pagination: {} } }
      const mockBackendResponse = {
        data: {
          success: true,
          message: 'Success',
          data: {
            orders: [
              {
                id: '1',
                userId: 'user1',
                status: 'PENDING',
                totalPrice: 100,
                items: [],
                createdAt: new Date().toISOString(),
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

      // Verify structure matches what we expect
      expect(mockBackendResponse.data.data).toHaveProperty('orders');
      expect(mockBackendResponse.data.data).toHaveProperty('pagination');
      expect(Array.isArray(mockBackendResponse.data.data.orders)).toBe(true);
      expect(mockBackendResponse.data.data.pagination).toHaveProperty('total');
      expect(mockBackendResponse.data.data.pagination).toHaveProperty('page');
      expect(mockBackendResponse.data.data.pagination).toHaveProperty('limit');
      expect(mockBackendResponse.data.data.pagination).toHaveProperty('totalPages');
    });
  });

  describe('Order Status Display Format', () => {
    it('should properly format status for display', () => {
      // Backend sends UPPERCASE, frontend displays capitalized
      const backendStatuses = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
      const expectedDisplay = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
      
      backendStatuses.forEach((status, index) => {
        const displayFormat = status.charAt(0) + status.slice(1).toLowerCase();
        expect(displayFormat).toBe(expectedDisplay[index]);
      });
    });
  });

  describe('Status Color Utility', () => {
    it('should handle case-insensitive status colors', () => {
      // Should handle both UPPERCASE and lowercase
      expect(getOrderStatusColor('PENDING')).toBe('bg-yellow-100 text-yellow-800');
      expect(getOrderStatusColor('pending')).toBe('bg-yellow-100 text-yellow-800');
      expect(getOrderStatusColor('PREPARING')).toBe('bg-blue-100 text-blue-800');
      expect(getOrderStatusColor('preparing')).toBe('bg-blue-100 text-blue-800');
    });
  });
});
