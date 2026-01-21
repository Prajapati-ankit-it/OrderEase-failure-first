# Backend DTOs

This directory contains TypeScript type definitions that **exactly mirror** the backend DTOs and entity structures.

## Purpose

- ✅ Ensure type safety between frontend and backend
- ✅ Single source of truth (backend defines the contract)
- ✅ No `any` types or inline object shapes
- ✅ Prevent silent bugs from API mismatches

## Structure

```
backend/
├── common.types.ts    # Shared types (Role, ApiResponse)
├── auth.types.ts      # Auth DTOs (Login, SignUp)
├── user.types.ts      # User DTOs and User entity
├── admin.types.ts     # Admin DTOs
├── food.types.ts      # Food DTOs and Food entity
├── cart.types.ts      # Cart DTOs and Cart entity
├── order.types.ts     # Order DTOs, Order entity, OrderStatus
└── index.ts           # Central export file
```

## Usage

### In JavaScript files (with JSDoc)

```javascript
/**
 * @typedef {import('types/backend').LoginDto} LoginDto
 * @typedef {import('types/backend').ApiResponse} ApiResponse
 */

/**
 * @param {LoginDto} credentials
 * @returns {Promise<ApiResponse>}
 */
async function login(credentials) {
  // ...
}
```

### In TypeScript files

```typescript
import { LoginDto, ApiResponse, SafeUser } from 'types/backend';

async function login(credentials: LoginDto): Promise<ApiResponse<SafeUser>> {
  // ...
}
```

## Mapping to Backend

| Frontend File | Backend Source |
|--------------|----------------|
| `common.types.ts` | `backend/src/constants/index.ts`, `backend/src/utils/response.util.ts` |
| `auth.types.ts` | `backend/src/auth/dto/*.ts` |
| `user.types.ts` | `backend/src/user/dto/*.ts`, `backend/src/user/domain/user.entity.ts` |
| `admin.types.ts` | `backend/src/admin/dto/*.ts` |
| `food.types.ts` | `backend/src/food/dto/*.ts`, `backend/src/food/domain/food.entity.ts` |
| `cart.types.ts` | `backend/src/cart/dto/*.ts`, `backend/src/cart/domain/cart.entity.ts` |
| `order.types.ts` | `backend/src/order/dto/*.ts`, `backend/src/order/domain/order.entity.ts` |

## Rules

❌ **DO NOT:**
- Add frontend-only fields to DTOs
- Guess backend structure
- Use `any` types
- Create inline object shapes in API calls

✅ **DO:**
- Keep DTOs in sync with backend
- Use these types in all API calls
- Update types when backend changes
- Reference backend source files in comments

## Maintenance

When backend DTOs change:
1. Check the corresponding backend file
2. Update the frontend type to match **exactly**
3. Update the JSDoc comments with the backend file reference
4. Verify no frontend-only fields were added
