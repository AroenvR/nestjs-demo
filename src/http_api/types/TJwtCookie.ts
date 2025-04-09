import { UUID } from 'crypto';

/**
 * Interface for the HTTP-Only JWT cookie.
 * @param uuid The UUID of the user.
 * @param username The username of the user.
 * @param createdAt The timestamp when the JWT was created.
 * @param version The version of the JWT.
 */
export type TJwtCookie = { uuid: UUID; username: string; uniquefier: string; version: number; iat: number; exp: number };
