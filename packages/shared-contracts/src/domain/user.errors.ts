/**
 * User Domain Errors
 */

export class UserDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'UserDomainError';
  }

  static notFound(): UserDomainError {
    return new UserDomainError('User not found', 'USER_NOT_FOUND');
  }

  static alreadyExists(): UserDomainError {
    return new UserDomainError('User already exists', 'USER_ALREADY_EXISTS');
  }

  static invalidCredentials(): UserDomainError {
    return new UserDomainError('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  static invalidPassword(): UserDomainError {
    return new UserDomainError(
      'Current password is incorrect',
      'INVALID_PASSWORD',
    );
  }
}
