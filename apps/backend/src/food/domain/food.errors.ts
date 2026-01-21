/**
 * Food Domain Errors
 */

export class FoodDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'FoodDomainError';
  }

  static notFound(): FoodDomainError {
    return new FoodDomainError('Food item not found', 'FOOD_NOT_FOUND');
  }

  static unavailable(): FoodDomainError {
    return new FoodDomainError(
      'Food item is not available',
      'FOOD_UNAVAILABLE',
    );
  }

  static invalidPrice(): FoodDomainError {
    return new FoodDomainError('Price must be positive', 'INVALID_PRICE');
  }
}
