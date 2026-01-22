/**
 * Order Domain Errors
 * Pure domain errors with no framework dependencies
 */

export class OrderDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'OrderDomainError';
  }

  static emptyOrder(): OrderDomainError {
    return new OrderDomainError(
      'Order must contain at least one item',
      'EMPTY_ORDER',
    );
  }

  static invalidQuantity(): OrderDomainError {
    return new OrderDomainError(
      'All items must have positive quantities',
      'INVALID_QUANTITY',
    );
  }

  static invalidPrice(): OrderDomainError {
    return new OrderDomainError(
      'All items must have positive prices',
      'INVALID_PRICE',
    );
  }

  static unavailableFood(): OrderDomainError {
    return new OrderDomainError(
      'Some food items are not available',
      'UNAVAILABLE_FOOD',
    );
  }

  static emptyCart(): OrderDomainError {
    return new OrderDomainError('Cart is empty', 'EMPTY_CART');
  }

  static orderNotFound(): OrderDomainError {
    return new OrderDomainError('Order not found', 'ORDER_NOT_FOUND');
  }

  static cannotCancel(): OrderDomainError {
    return new OrderDomainError(
      'Order cannot be cancelled in current state',
      'CANNOT_CANCEL',
    );
  }
}
