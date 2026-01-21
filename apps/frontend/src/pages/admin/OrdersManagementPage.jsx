import React from 'react';
import { useOrdersManagement } from '../../hooks';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { ErrorMessage } from '../../components/ui';
import { formatStatusForDisplay } from '../../utils';

const OrdersManagementPage = () => {
  const {
    orders,
    pagination,
    selectedStatus,
    loading,
    error,
    selectedOrder,
    statuses,
    fetchOrders,
    handleStatusUpdate,
    getStatusColor,
    handleStatusFilterChange,
    handlePageChange,
    handleOrderSelect,
    handleCloseOrderDetails,
  } = useOrdersManagement();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
          <button
            onClick={fetchOrders}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={fetchOrders} />
          </div>
        )}

        {/* Status Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          {Array.isArray(statuses) && statuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilterChange(status)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                selectedStatus === status
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-orange-100'
              }`}
            >
              {formatStatusForDisplay(status)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : !Array.isArray(orders) || orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.isArray(orders) && orders.map((order) => (
              <div key={order._id || order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Order #{order._id.slice(-8)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {formatStatusForDisplay(order.status)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="font-semibold text-gray-800">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.phone}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {order.orderType}
                      {order.tableNumber && ` - Table ${order.tableNumber}`}
                    </p>
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <p className="font-semibold text-gray-800 mb-2">Items:</p>
                    <ul className="space-y-1">
                      {Array.isArray(order.items) && order.items.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 flex justify-between">
                          <span>{item.name} x {item.quantity}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-orange-600">₹{order.totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'PREPARING')}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'READY')}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'DELIVERED')}
                        className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition text-sm"
                      >
                        Mark Delivered
                      </button>
                    )}
                    <button
                      onClick={() => handleOrderSelect(order)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                pagination.page === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <span className="text-gray-500 text-sm">
                ({pagination.total} total orders)
              </span>
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                pagination.page >= pagination.totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Details</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">{selectedOrder.customerName}</p>
                  <p className="text-sm">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Type</p>
                  <p className="font-semibold capitalize">{selectedOrder.orderType}</p>
                </div>
                {selectedOrder.tableNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Table Number</p>
                    <p className="font-semibold">{selectedOrder.tableNumber}</p>
                  </div>
                )}
                {selectedOrder.deliveryAddress && (
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="font-semibold">{selectedOrder.deliveryAddress}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {formatStatusForDisplay(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Items</p>
                  <ul className="space-y-2">
                    {selectedOrder && Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="font-semibold">₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-orange-600">₹{selectedOrder.totalPrice}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Time</p>
                  <p className="text-sm">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={handleCloseOrderDetails}
                className="w-full mt-6 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagementPage;
