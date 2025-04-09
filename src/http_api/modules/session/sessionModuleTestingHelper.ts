import { Response } from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { SessionEntity } from '../../../domain/session/SessionEntity';

/**
 * Verifies that both the JWT and the session were updated after a /refresh call.
 * @param originalResp The original response from the login call
 * @param originalSession The original session entity from the login call
 * @param refreshResp The response from the refresh call
 * @param refreshedSession The session entity from the refresh call
 * @param jwtService The JWT service used to decode the JWT
 */
export const verifyRefreshData = (
	originalResp: Response,
	originalSession: SessionEntity,
	refreshResp: Response,
	refreshedSession: SessionEntity,
	jwtService: JwtService,
) => {
	// Capture the login response's JWT data
	let originalJwtCookie = '';
	for (const header of originalResp.headers['set-cookie']) {
		if (header.includes('jwt=ey')) originalJwtCookie = header;
	}
	const originalJwt = originalJwtCookie.split(';')[0].replace('jwt=', '');

	const originalPayload = jwtService.decode(originalJwt);
	const originalIat = originalPayload.iat;
	const originalExp = originalPayload.exp;

	// Capture the refresh response's JWT data
	let refreshedJwtCookie = '';
	for (const header of refreshResp.headers['set-cookie']) {
		if (header.includes('jwt=ey')) refreshedJwtCookie = header;
	}
	const refreshedJwt = refreshedJwtCookie.split(';')[0].replace('jwt=', '');

	const refreshedPayload = jwtService.decode(refreshedJwt);
	const refreshedIat = refreshedPayload.iat;
	const refreshedExp = refreshedPayload.exp;

	// Verify the refreshed JWT's timestamps are newer
	expect(refreshedIat).toBeGreaterThan(originalIat);
	expect(refreshedExp).toBeGreaterThan(originalExp);

	// Compare the original and refreshed session
	expect(refreshedSession.token).not.toEqual(originalSession.token);
	expect(refreshedSession.refreshes).toEqual(originalSession.refreshes + 1);
};
