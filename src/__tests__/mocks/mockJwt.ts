import { randomUUID } from "crypto";
import * as jwt from "jsonwebtoken";
import { MockUserEntity } from "./entity/MockUserEntity";
import { serverConfig } from "../../infrastructure/configuration/serverConfig";
import { securityConstants } from "../../common/constants/securityConstants";
import { IAccessCookie, IBearerToken, IHttpOnlyCookie } from "../../common/interfaces/JwtInterfaces";

const bearerSecret = process.env[securityConstants.bearerAccessTokenEnvVar] || "token_testing_secret";
const cookieSecret = process.env[securityConstants.refreshCookieEnvVar] || "cookie_testing_secret";
const accessCookieSecret = process.env[securityConstants.accessCookieEnvVar] || "access_cookie_testing_secret";

const tokenExpiry = serverConfig().security.bearer.expiry;
const cookieExpiry = serverConfig().security.refresh_cookie.expiry;
const accessCookieExpiry = serverConfig().security.access_cookie.expiry;

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

/* ---------------------------------- */
/* Mock Access HTTP-Only Cookie JWT's */
/* ---------------------------------- */

const accessCookie: IAccessCookie = {
	sub: user.uuid,
	roles: [],
	jti: randomUUID(),
	iat: Math.floor(Date.now() / 1000),
	exp: Math.floor(Date.now() / 1000) + accessCookieExpiry,
};

const expiredAccessToken: IAccessCookie = {
	sub: user.uuid,
	roles: [],
	jti: randomUUID(),
	iat: Math.floor(Date.now() / 1000) - (tokenExpiry + 10000),
	exp: Math.floor(Date.now() / 1000) - tokenExpiry,
};

const faultyAccessCookie: IAccessCookie = {
	sub: randomUUID(),
	roles: [],
	jti: randomUUID(),
	iat: Math.floor(Date.now() / 1000),
	exp: Math.floor(Date.now() / 1000) + accessCookieExpiry,
};

/**
 * A mock plain text (unsigned) Access cookie for testing purposes.
 */
export const mockPlainTextAccessCookie = accessCookie;

/**
 * A mock (signed) Access HTTP-Only Cookie for testing purposes.
 */
export const mockAccessHttpCookie = jwt.sign(accessCookie, accessCookieSecret);

/**
 * A mock expired (signed) Access HTTP-Only Cookie for testing purposes.
 */
export const mockExpiredAccessToken = jwt.sign(expiredAccessToken, accessCookieSecret);

/**
 * A mock faulty (signed) Access HTTP-Only Cookie for testing purposes.
 */
export const mockFaultyAccessHttpCookie = jwt.sign(faultyAccessCookie, accessCookieSecret);

/* ----------------------------------- */
/* Mock Refresh HTTP-Only Cookie JWT's */
/* ----------------------------------- */

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
