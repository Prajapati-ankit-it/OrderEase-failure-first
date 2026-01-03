/**
 * Type for JWT expiration time values
 * Matches the format expected by @nestjs/jwt
 */
export type JwtExpiresIn =
  | `${number}d`
  | `${number}h`
  | `${number}m`
  | `${number}s`;

/**
 * Parse a string expiration value into a properly typed JwtExpiresIn
 * @param value - The string value from environment (e.g., '7d', '24h')
 * @param defaultValue - Default value if not provided
 * @returns Properly typed expiration value
 */
export function parseJwtExpiration(
  value: string | undefined,
  defaultValue: JwtExpiresIn = '7d',
): JwtExpiresIn {
  if (!value) {
    return defaultValue;
  }
  // The value is expected to be in the correct format already
  return value as JwtExpiresIn;
}
