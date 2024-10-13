import * as jwt from 'jsonwebtoken';

const jwtSecret = process.env.JASON_WEB_TOKEN_SECRET || 'jwt_testing_secret';
const jwtExpiry = process.env.JASON_WEB_TOKEN_EXPIRY || '1h';

export const mockJwt = jwt.sign(
	{
		sub: 'testUserId',
		username: 'testUser',
		version: 1, // Ensure this matches CURRENT_JWT_VERSION
	},
	jwtSecret,
	{ expiresIn: jwtExpiry },
);
