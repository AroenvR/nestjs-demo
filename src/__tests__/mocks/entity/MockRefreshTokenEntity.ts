import { RefreshTokenEntity } from "../../../domain/refresh_token/RefreshTokenEntity";
import { mockPlainTextBearerToken } from "../mockJwt";

/**
 * A Mock {@link RefreshTokenEntity} for testing purposes.
 */
export class MockRefreshTokenEntity {
	private constructor() {}

	public static get() {
		return RefreshTokenEntity.create({
			id: 1001,
			uuid: "f3283ead-3afc-4460-8160-38a596b2145a",
			createdAt: Date.now() - 10 * 60 * 1000, // 10 minutes ago
			jti: mockPlainTextBearerToken.jti,
			sub: mockPlainTextBearerToken.sub,
			hash: "c98c24b677eff44860afea6f493bbaec5bb1c4cbb209c6fc2bbb47f66ff2ad31",
			lastRefreshedAt: Date.now() - 10 * 60 * 1000, // 10 minutes ago
		});
	}
}
