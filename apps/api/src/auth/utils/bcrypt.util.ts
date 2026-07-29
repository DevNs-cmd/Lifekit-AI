import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

/**
 * Hashes a plaintext password using bcrypt.
 * @param password Plaintext password to hash
 * @returns A promise that resolves to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, AUTH_CONSTANTS.SALT_ROUNDS);
}

/**
 * Compares a plaintext password against a bcrypt hash.
 * @param password Plaintext password
 * @param hash Bcrypt hash to compare against
 * @returns A promise that resolves to a boolean indicating match status
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Computes a SHA-256 hash of a refresh token for secure storage.
 * Uses Node.js crypto module — prevents storing plaintext tokens in the database.
 * @param token The raw JWT refresh token
 * @returns Hex-encoded SHA-256 hash
 */
export function hashRefreshToken(token: string): string {
  return crypto
    .createHash(AUTH_CONSTANTS.TOKEN_HASH_ALGORITHM)
    .update(token)
    .digest(AUTH_CONSTANTS.TOKEN_HASH_ENCODING);
}
