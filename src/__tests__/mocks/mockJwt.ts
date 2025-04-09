import * as jwt from 'jsonwebtoken';
import { MockUserEntity } from './entity/MockUserEntity';
import { randomUUID } from 'crypto';
import { serverConfig } from '../../infrastructure/configuration/serverConfig';

const jwtSecret = process.env.JASON_WEB_TOKEN_SECRET || 'jwt_testing_secret';
const user = MockUserEntity.get();

export const mockJwt = jwt.sign(
	{
		uuid: user.uuid,
		username: user.username,
	},
	jwtSecret,
	{ expiresIn: serverConfig().security.cookie.expiry },
);

export const expiredJwt = jwt.sign(
	{
		uuid: user.uuid,
		username: user.username,
	},
	jwtSecret,
	{ expiresIn: '-1h' },
);

export const faultyJwt = jwt.sign(
	{
		uuid: randomUUID(),
		username: 'faulty_user',
	},
	jwtSecret,
	{ expiresIn: serverConfig().security.cookie.expiry },
);
