/**
 * Cart Domain Errors
 */

export class CartDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'CartDomainError';
  }

  static notFound(): CartDomainError {
    return new CartDomainError('Cart not found', 'CART_NOT_FOUND');
  }

  static itemNotFound(): CartDomainError {
    return new CartDomainError('Cart item not found', 'CART_ITEM_NOT_FOUND');
  }

  static emptyCart(): CartDomainError {
    return new CartDomainError('Cart is empty', 'EMPTY_CART');
  }
}
