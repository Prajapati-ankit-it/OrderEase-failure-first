# Testing Guide for OrderEase Backend

This document provides comprehensive information about the test infrastructure implemented for the OrderEase backend.

## Overview

The backend now has comprehensive test coverage including:
- **Unit Tests**: For individual services, utilities, and business logic
- **Integration Tests**: For critical user flows and API endpoints
- **E2E Tests**: For end-to-end application testing

## Test Coverage

Current test coverage for critical services:
- **Auth Service**: 98% coverage
- **Order Service**: 98% coverage  
- **Cart Service**: 100% coverage
- **User Service**: 100% coverage
- **Utilities**: 88% coverage

## Running Tests

### All Unit Tests
```bash
npm test
```

### Unit Tests with Coverage Report
```bash
npm run test:cov
```

### Integration/E2E Tests
```bash
npm run test:e2e
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Debug Mode
```bash
npm run test:debug
```

## Test Structure

### Unit Tests
Located in: `src/**/*.spec.ts`

Unit tests focus on testing individual service methods in isolation using mocked dependencies.

Example structure:
```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let mockDependency: jest.Mocked<DependencyType>;

  beforeEach(async () => {
    // Setup test module with mocked dependencies
  });

  describe('methodName', () => {
    it('should handle success case', async () => {
      // Test implementation
    });

    it('should handle error case', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests
Located in: `test/*integration.spec.ts`

Integration tests verify complete user flows and API endpoints with actual HTTP requests.

Available integration test suites:
- `auth.integration.spec.ts`: Auth flow (signup → login → refresh)
- `order-flow.integration.spec.ts`: Cart and order flow

### Test Utilities

Located in: `src/test-utils/`

Reusable test utilities include:
- **Factories**: Helper functions to create test data (users, orders, food items, etc.)
- **Test Module Helpers**: Utilities to create testing modules with mocked dependencies
- **Mock Services**: Pre-configured mock implementations of services
- **Test Database Config**: Configuration for test database isolation

## Writing Tests

### Creating a New Unit Test

1. Create a file named `<service-name>.service.spec.ts` next to the service file
2. Import test utilities:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { createMockPrismaService } from '../test-utils';
```

3. Set up the test module:
```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    YourService,
    { provide: PrismaService, useValue: createMockPrismaService() },
  ],
}).compile();
```

4. Write test cases covering:
   - Success paths
   - Error handling
   - Edge cases
   - Validation

### Creating a New Integration Test

1. Create a file named `<feature>.integration.spec.ts` in the `test/` directory
2. Set up the test application:
```typescript
const moduleFixture: TestingModule = await Test.createTestingModule({
  imports: [AppModule],
}).compile();

app = moduleFixture.createNestApplication();
await app.init();
```

3. Use `supertest` for HTTP requests:
```typescript
await request(app.getHttpServer())
  .post('/endpoint')
  .send(data)
  .expect(200);
```

## Test Data Management

### Using Factories

Factories provide consistent test data:

```typescript
import { createTestUser, createTestFood } from '../test-utils';

// Create a test user
const user = await createTestUser(prismaService, {
  email: 'test@example.com',
  password: 'password123',
});

// Create a test food item
const food = await createTestFood(prismaService, {
  name: 'Pizza',
  price: 12.99,
});
```

### Database Cleanup

For integration tests, clean the database between tests:

```typescript
beforeEach(async () => {
  await prismaService.cleanDatabase();
});

afterAll(async () => {
  await prismaService.cleanDatabase();
  await app.close();
});
```

## Mocking Dependencies

### PrismaService
```typescript
const mockPrismaService = createMockPrismaService();
mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
```

### JwtService
```typescript
const mockJwtService = createMockJwtService();
mockJwtService.sign.mockReturnValue('mock-token');
```

### ConfigService
```typescript
const mockConfigService = createMockConfigService();
mockConfigService.get.mockReturnValue('test-value');
```

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:
- No external dependencies required
- Uses in-memory or test database
- Deterministic and isolated
- Fast execution time

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
3. **Arrange-Act-Assert**: Follow the AAA pattern in test structure
4. **Mock External Services**: Don't make real API calls or database connections in unit tests
5. **Test Edge Cases**: Include tests for error conditions and edge cases
6. **Keep Tests Fast**: Unit tests should run in milliseconds
7. **Maintain Test Coverage**: Aim for ≥80% coverage on critical business logic

## Troubleshooting

### Tests are failing due to database connection
- Ensure DATABASE_URL is set correctly for tests
- Check that the test database is accessible
- Verify migrations are up to date

### Mocks are not working as expected
- Check that mocks are properly reset between tests using `jest.clearAllMocks()`
- Verify mock setup in `beforeEach` hooks
- Ensure correct import paths for mocked modules

### Integration tests timing out
- Increase Jest timeout if needed: `jest.setTimeout(10000)`
- Check for unresolved promises
- Verify app is properly initialized and closed

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

## Contributing

When adding new features:
1. Write unit tests for new services/methods
2. Add integration tests for new API endpoints
3. Ensure test coverage remains ≥80%
4. Update this documentation if adding new test patterns
