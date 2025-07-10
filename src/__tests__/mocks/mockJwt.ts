import { randomUUID } from "crypto";
import * as jwt from "jsonwebtoken";
import { MockUserEntity } from "./entity/MockUserEntity";
import { serverConfig } from "../../infrastructure/configuration/serverConfig";
import { securityConstants } from "../../common/constants/securityConstants";
import { IBearerToken, IHttpOnlyCookie } from "../../common/interfaces/JwtInterfaces";
import { TJwtCookie } from "../../common/types/TJwtCookie";

const bearerSecret = process.env[securityConstants.bearerAccessTokenEnvVar] || "token_testing_secret";
const cookieSecret = process.env[securityConstants.httpOnlyCookieEnvVar] || "cookie_testing_secret";

const tokenExpiry = serverConfig().security.bearer.expiry;
const cookieExpiry = serverConfig().security.cookie.expiry;

const user = MockUserEntity.get();

/* ------------------------------ */
/* Mock Bearer access token JWT's */
/* ------------------------------ */

const bearerToken: IBearerToken = {
	sub: user.uuid,
	roles: [],
	jti: randomUUID(),
	iat: Math.floor(Date.now() / 1000),
	exp: Math.floor(Date.now() / 1000) + tokenExpiry,
};

const expiredBearerToken: IBearerToken = {
	sub: user.uuid,
	roles: [],
	jti: randomUUID(),
	iat: Math.floor(Date.now() / 1000) - (tokenExpiry + 10000),
	exp: Math.floor(Date.now() / 1000) - tokenExpiry,
};

const faultyBearerToken: IBearerToken = {
	sub: randomUUID(),
	roles: [],
	jti: randomUUID(),
	iat: Math.floor(Date.now() / 1000),
	exp: Math.floor(Date.now() / 1000) + tokenExpiry,
};

/**
 * A mock plain text (unsigned) Bearer token for testing purposes.
 */
export const mockPlainTextBearerToken = bearerToken;

/**
 * A mock (signed) Bearer token for testing purposes.
 */
export const mockBearerToken = jwt.sign(bearerToken, bearerSecret);

/**
 * A mock expired (but signed) Bearer token for testing purposes.
 */
export const mockExpiredBearerToken = jwt.sign(expiredBearerToken, bearerSecret);

/**
 * A mock faulty (but signed) Bearer token for testing purposes.
 */
export const mockFaultyBearerToken = jwt.sign(faultyBearerToken, bearerSecret);

/* --------------------------- */
/* Mock HTTP-Only Cookie JWT's */
/* --------------------------- */

const httpOnlyCookie: IHttpOnlyCookie = {
	jti: randomUUID(),
	iat: Math.floor(Date.now() / 1000),
	exp: Math.floor(Date.now() / 1000) + cookieExpiry,
};

/**
 * A mock plain text (unsigned) HTTP-Only Cookie for testing purposes.
 */
export const mockPlainTextHttpOnlyJwtCookie = httpOnlyCookie;

/**
 * A mock (signed) HTTP-Only Cookie for testing purposes.
 */
export const mockHttpOnlyCookie = jwt.sign(httpOnlyCookie, cookieSecret);

/* ------------------------------ */
/* THE BELOW JWT'S ARE DEPRECATED */
/* ------------------------------ */

const cookie: TJwtCookie = {
	uuid: user.uuid,
	username: user.username,
	uniquefier: randomUUID(),
	iat: Math.floor(Date.now() / 1000),
	exp: Math.floor(Date.now() / 1000) + tokenExpiry,
};

/**
 * @deprecated
 */
export const mockPlainTextJwt = cookie;

/**
 * @deprecated
 */
export const mockJwt = jwt.sign(cookie, bearerSecret);

// @ts-expect-error: Setting the `iat` and `exp` values bricks the JWT signing.
const expiredCookie: TJwtCookie = {
	uuid: user.uuid,
	username: user.username,
	uniquefier: randomUUID(),
};

/**
 * @deprecated
 */
export const expiredJwt = jwt.sign(expiredCookie, bearerSecret, { expiresIn: "-1h" });

const faultyCookie: TJwtCookie = {
	uuid: randomUUID(),
	username: randomUUID().toString(),
	uniquefier: randomUUID(),
	iat: Math.floor(Date.now() / 1000),
	exp: Math.floor(Date.now() / 1000) + tokenExpiry,
};

/**
 * @deprecated
 */
export const faultyJwt = jwt.sign(faultyCookie, bearerSecret);
