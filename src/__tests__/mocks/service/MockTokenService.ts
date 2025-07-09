import { ICreateAuthTokenData, IHttpOnlyCookie } from "../../../common/interfaces/JwtInterfaces";
import { mockBearerToken, mockHttpOnlyCookie } from "../mockJwt";

/**
 * Mocks a service that provides methods for creating and managing authentication tokens.
 */
export class MockTokenService {
	createAccessToken = jest.fn().mockImplementation((_: ICreateAuthTokenData) => {
		return mockBearerToken;
	});

	createHttpOnlyCookie = jest.fn().mockImplementation((_: ICreateAuthTokenData) => {
		return mockHttpOnlyCookie;
	});

	rotateRefreshToken = jest.fn().mockImplementation((_: IHttpOnlyCookie) => {
		return mockHttpOnlyCookie;
	});

	revokeRefreshToken = jest.fn().mockImplementation(() => {
		return;
	});
}
