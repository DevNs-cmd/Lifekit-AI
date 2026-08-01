export const AUTH_CONSTANTS = {
  JWT_CONFIG_KEY: "jwt",
  SALT_ROUNDS: 12,
  /** Algorithm used for hashing refresh tokens before storing in DB */
  TOKEN_HASH_ALGORITHM: "sha256",
  /** Encoding used for hashed token output */
  TOKEN_HASH_ENCODING: "hex" as const,
  /** Number of random bytes for JWT ID (jti) claim generation */
  JTI_BYTES: 32,
};
