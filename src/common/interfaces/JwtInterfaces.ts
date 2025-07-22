import { UUID } from "crypto";

/**
 * This interface represents the minimal structure of a JWT authentication token.
 * @property jti - The unique identifier for the token.
 * @property iat - The issued at time, represented as a Unix timestamp.
 * @property exp - The expiration time, represented as a Unix timestamp.
 */
interface IJwtData {
	jti: UUID;
	iat: number;
	exp: number;
}

/**
 * This interface represents the minimal requirements for a token in the authentication system.
 * @property sub - The subject of the token, typically the user UUID.
 * @property roles - An array of roles associated with the user.
 * @devnote Expand this interface with additional properties as needed, such a user ID, ...
 */
export interface ICreateAuthTokenData {
	sub: UUID;
	roles: string[];
}

/**
 * This interface represents the structure of an HTTP-only cookie that contains a JWT.
 * Extends the {@link IJwtData} interface to include the basic JWT properties.
 */
export interface IHttpOnlyCookie extends IJwtData {}

/**
 * This interface represents the structure of a Bearer JWT.
 * Extends the {@link IJwtData} interface to include the basic JWT properties.
 */
export interface IBearerToken extends IJwtData, ICreateAuthTokenData {}

/**
 * This interface represents the structure of an access token JWT used in NestJS applications.
 * @property user - An object that matches the {@link IBearerToken} interface.
 */
export interface INestJSBearerJwt {
	user: IBearerToken;
}

/**
 * This interface represents the structure of an HTTP-only cookie JWT used in NestJS applications.
 * @property user - An object that matches the {@link IHttpOnlyCookie} interface.
 */
export interface INestJSCookieJwt {
	user: IHttpOnlyCookie;
}
