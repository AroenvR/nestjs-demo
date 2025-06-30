import { randomUUID } from "crypto";
import * as jwt from "jsonwebtoken";
import { MockUserEntity } from "./entity/MockUserEntity";
import { serverConfig } from "../../infrastructure/configuration/serverConfig";
import { TJwtCookie } from "../../http_api/types/TJwtCookie";
import { securityConstants } from "../../common/constants/securityConstants";
import { INestJSBearerJwt, INestJSCookieJwt } from "../../common/interfaces/JwtInterfaces";

const cookieSecret = process.env[securityConstants.httpOnlyCookieEnvVar] || "cookie_testing_secret";
const bearerSecret = process.env[securityConstants.bearerAccessTokenEnvVar] || "token_testing_secret";

const cookieExpiry = serverConfig().security.cookie.expiry;
const user = MockUserEntity.get();

/* Mock Bearer access token JWT's */

const bearerToken: INestJSBearerJwt = {
	user: {
		sub: user.uuid,
		roles: [],
		jti: randomUUID(),
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + cookieExpiry,
	},
};
export const mockPlainTextBearerToken = bearerToken;
export const mockBearerToken = jwt.sign(bearerToken, bearerSecret);

const expiredBearerToken: INestJSBearerJwt = {
	// @ts-expect-error: Setting the `iat` and `exp` values bricks the JWT signing.
	user: {
		sub: user.uuid,
		roles: [],
		jti: randomUUID(),
	},
};
export const mockExpiredBearerToken = jwt.sign(expiredBearerToken, bearerSecret, { expiresIn: "-1h" });

const faultyBearerToken: INestJSBearerJwt = {
	user: {
		sub: randomUUID(),
		roles: [],
		jti: randomUUID(),
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + cookieExpiry,
	},
};
export const mockFaultyBearerToken = jwt.sign(faultyBearerToken, bearerSecret);

/* Mock HTTP-Only Cookie JWT's */

const httpOnlyCookie: INestJSCookieJwt = {
	user: {
		jti: randomUUID(),
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + cookieExpiry,
	},
};
export const mockPlainTextHttpOnlyJwtCookie = httpOnlyCookie;
export const mockHttpOnlyCookie = jwt.sign(httpOnlyCookie, cookieSecret);

/* THE BELOW JWT'S ARE DEPRECATED */

const cookie: TJwtCookie = {
	uuid: user.uuid,
	username: user.username,
	uniquefier: randomUUID(),
	iat: Math.floor(Date.now() / 1000),
	exp: Math.floor(Date.now() / 1000) + cookieExpiry,
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
	exp: Math.floor(Date.now() / 1000) + cookieExpiry,
};

/**
 * @deprecated
 */
export const faultyJwt = jwt.sign(faultyCookie, bearerSecret);
