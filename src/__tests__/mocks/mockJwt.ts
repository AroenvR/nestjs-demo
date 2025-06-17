import * as jwt from "jsonwebtoken";
import { MockUserEntity } from "./entity/MockUserEntity";
import { randomUUID } from "crypto";
import { serverConfig } from "../../infrastructure/configuration/serverConfig";
import { TJwtCookie } from "../../http_api/types/TJwtCookie";

const jwtSecret = process.env.JASON_WEB_TOKEN_SECRET || "jwt_testing_secret";
const tokenExpiry = serverConfig().security.cookie.expiry;

const user = MockUserEntity.get();

const cookie: TJwtCookie = {
	uuid: user.uuid,
	username: user.username,
	uniquefier: randomUUID(),
	iat: Math.floor(Date.now() / 1000),
	exp: Math.floor(Date.now() / 1000) + tokenExpiry,
};

export const mockPlainTextJwt = cookie;
export const mockJwt = jwt.sign(cookie, jwtSecret);

// @ts-expect-error: Setting the `iat` and `exp` values bricks the JWT signing.
const expiredCookie: TJwtCookie = {
	uuid: user.uuid,
	username: user.username,
	uniquefier: randomUUID(),
};
export const expiredJwt = jwt.sign(expiredCookie, jwtSecret, { expiresIn: "-1h" });

const faultyCookie: TJwtCookie = {
	uuid: randomUUID(),
	username: randomUUID().toString(),
	uniquefier: randomUUID(),
	iat: Math.floor(Date.now() / 1000),
	exp: Math.floor(Date.now() / 1000) + tokenExpiry,
};
export const faultyJwt = jwt.sign(faultyCookie, jwtSecret);
