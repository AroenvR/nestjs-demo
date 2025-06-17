import { UUID } from "crypto";

/**
 * Interface for the HTTP-Only JWT cookie.
 * @param uuid The UUID of the user.
 * @param username The username of the user.
 * @param createdAt The timestamp when the JWT was created.
 */
export type TJwtCookie = {
	uuid: UUID;
	username: string;
	uniquefier: string;
	iat: number;
	exp: number;
};
