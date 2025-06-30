import * as jwt from "jsonwebtoken";
import { MockUserEntity } from "./entity/MockUserEntity";
import { randomUUID } from "crypto";
import { serverConfig } from "../../infrastructure/configuration/serverConfig";
import { TJwtCookie } from "../../http_api/types/TJwtCookie";
import { securityConstants } from "../../common/constants/securityConstants";
import { INestJSBearerJwt, INestJSCookieJwt } from "src/common/interfaces/JwtInterfaces";

const jwtSecret = process.env[securityConstants.jwtEnvVar] || "jwt_testing_secret";
const tokenExpiry = serverConfig().security.cookie.expiry;

const user = MockUserEntity.get();

const bearerToken: INestJSBearerJwt = {
	user: {
		sub: user.uuid,
		roles: [],
		jti: randomUUID(),
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + tokenExpiry,
	},
};
export const mockPlainTextBearerToken = bearerToken;
export const mockBearerToken = jwt.sign(bearerToken, jwtSecret);

const httpOnlyCookie: INestJSCookieJwt = {
	user: {
		jti: randomUUID(),
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + tokenExpiry,
	},
};
export const mockPlainTextHttpOnlyJwtCookie = httpOnlyCookie;
export const mockHttpOnlyCookie = jwt.sign(httpOnlyCookie, jwtSecret);

/* THE BELOW JWT'S ARE DEPRECATED */

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
export const mockJwt = jwt.sign(cookie, jwtSecret);

// @ts-expect-error: Setting the `iat` and `exp` values bricks the JWT signing.
const expiredCookie: TJwtCookie = {
	uuid: user.uuid,
	username: user.username,
	uniquefier: randomUUID(),
};

/**
 * @deprecated
 */
export const expiredJwt = jwt.sign(expiredCookie, jwtSecret, { expiresIn: "-1h" });

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
export const faultyJwt = jwt.sign(faultyCookie, jwtSecret);
