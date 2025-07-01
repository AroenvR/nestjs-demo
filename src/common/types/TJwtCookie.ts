import { UUID } from "crypto";

/**
 * The values a controller's request object could contain.
 * @param user The HTTP-Only JWT cookie containing user information.
 * @deprecated
 */
export type TRequest = {
	user: TJwtCookie;
};

/**
 * Interface for the HTTP-Only JWT cookie.
 * @param uuid The UUID of the user.
 * @param username The username of the user.
 * @param createdAt The timestamp when the JWT was created.
 * @deprecated
 */
export type TJwtCookie = {
	uuid: UUID;
	username: string;
	uniquefier: string;
	iat: number;
	exp: number;
};
