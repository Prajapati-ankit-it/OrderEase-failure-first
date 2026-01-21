/**
 * Orders Slice Tests
 * Tests order state management with pagination
 */

import ordersReducer, {
  fetchAllOrders,
  createOrder,
  updateOrderStatus,
  clearOrdersError,
  clearCurrentOrder,
} from './ordersSlice';
import { ordersApi } from '../../services/api';

// Mock the orders API
jest.mock('../../services/api', () => ({
  ordersApi: {
    getAllOrders: jest.fn(),
    createOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
  },
}));

describe('ordersSlice', () => {
  const initialState = {
    orders: [],
    currentOrder: null,
    stats: null,
    loading: false,
    error: null,
    lastFetched: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reducers', () => {
    it('should handle clearOrdersError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error',
      };

      const state = ordersReducer(stateWithError, clearOrdersError());

      expect(state.error).toBeNull();
    });

    it('should handle clearCurrentOrder', () => {
      const stateWithOrder = {
        ...initialState,
        currentOrder: { _id: '123', status: 'PENDING' },
      };

      const state = ordersReducer(stateWithOrder, clearCurrentOrder());

      expect(state.currentOrder).toBeNull();
    });
  });

  describe('fetchAllOrders async thunk', () => {
    it('should handle paginated response from backend', async () => {
      const mockResponse = {
        orders: [
          {
            _id: '123',
            userId: 'user1',
            status: 'PENDING',
            totalPrice: 100,
            items: [],
          },
        ],
        pagination: {
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3,
        },
      };

      ordersApi.getAllOrders.mockResolvedValue(mockResponse);

      const action = await fetchAllOrders.fulfilled(mockResponse, '', {});

      const state = ordersReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.orders).toEqual(mockResponse.orders);
      expect(state.pagination).toEqual(mockResponse.pagination);
      expect(state.lastFetched).toBeTruthy();
    });

    it('should handle array response (fallback)', async () => {
      const mockResponse = [
        {
          _id: '123',
          status: 'PENDING',
        },
      ];

      ordersApi.getAllOrders.mockResolvedValue(mockResponse);

      const action = await fetchAllOrders.fulfilled(mockResponse, '', {});

      const state = ordersReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.orders).toEqual(mockResponse);
    });

    it('should handle empty orders list', async () => {
      const mockResponse = {
        orders: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };

      const action = await fetchAllOrders.fulfilled(mockResponse, '', {});

      const state = ordersReducer(initialState, action);

      expect(state.orders).toEqual([]);
      expect(state.pagination.total).toBe(0);
    });

    it('should handle fetch pending', () => {
      const action = fetchAllOrders.pending('', {});
      const state = ordersReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetch rejected', () => {
      const errorMessage = 'Failed to fetch orders';
      const action = fetchAllOrders.rejected(null, '', {}, errorMessage);
      const state = ordersReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('createOrder async thunk', () => {
    it('should add new order to state', async () => {
      const mockOrder = {
        _id: '123',
        userId: 'user1',
        status: 'PENDING',
        totalPrice: 100,
        items: [{ foodId: 'food1', quantity: 2, price: 50 }],
      };

      ordersApi.createOrder.mockResolvedValue(mockOrder);

      const action = await createOrder.fulfilled(mockOrder, '', {});

      const state = ordersReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.currentOrder).toEqual(mockOrder);
      expect(state.orders[0]).toEqual(mockOrder);
    });

    it('should handle create pending', () => {
      const action = createOrder.pending('', {});
      const state = ordersReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle create rejected', () => {
      const errorMessage = 'Failed to create order';
      const action = createOrder.rejected(null, '', {}, errorMessage);
      const state = ordersReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('updateOrderStatus async thunk', () => {
    it('should update order status in state', async () => {
      const stateWithOrders = {
        ...initialState,
        orders: [
          { _id: '123', status: 'PENDING' },
          { _id: '456', status: 'PREPARING' },
        ],
      };

      const updatedOrder = { _id: '123', status: 'PREPARING' };

      ordersApi.updateOrderStatus.mockResolvedValue(updatedOrder);

      const action = await updateOrderStatus.fulfilled(updatedOrder, '', {
        id: '123',
        status: 'PREPARING',
      });

      const state = ordersReducer(stateWithOrders, action);

      expect(state.loading).toBe(false);
      expect(state.orders[0].status).toBe('PREPARING');
      expect(state.orders[1].status).toBe('PREPARING');
    });

    it('should update currentOrder if it matches', async () => {
      const stateWithCurrentOrder = {
        ...initialState,
        currentOrder: { _id: '123', status: 'PENDING' },
        orders: [{ _id: '123', status: 'PENDING' }],
      };

      const updatedOrder = { _id: '123', status: 'PREPARING' };

      const action = await updateOrderStatus.fulfilled(updatedOrder, '', {
        id: '123',
        status: 'PREPARING',
      });

      const state = ordersReducer(stateWithCurrentOrder, action);

      expect(state.currentOrder.status).toBe('PREPARING');
    });

    it('should handle update pending', () => {
      const action = updateOrderStatus.pending('', { id: '123', status: 'PREPARING' });
      const state = ordersReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle update rejected', () => {
      const errorMessage = 'Failed to update status';
      const action = updateOrderStatus.rejected(null, '', {}, errorMessage);
      const state = ordersReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });
});
