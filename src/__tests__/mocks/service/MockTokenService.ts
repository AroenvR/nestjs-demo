import { ICreateAuthTokenData, IHttpOnlyCookie } from "../../../common/interfaces/JwtInterfaces";
import { mockBearerToken, mockHttpOnlyCookie, mockAccessHttpCookie } from "../mockJwt";

/**
 * Mocks a service that provides methods for creating and managing authentication tokens.
 */
export class MockTokenService {
	createAccessToken = jest.fn().mockImplementation((_: ICreateAuthTokenData) => {
		return mockBearerToken;
	});

	createRefreshCookie = jest.fn().mockImplementation((_: ICreateAuthTokenData) => {
		return mockHttpOnlyCookie;
	});

	createAccessCookie = jest.fn().mockImplementation((_: ICreateAuthTokenData) => {
		return mockAccessHttpCookie;
	});

	rotateRefreshToken = jest.fn().mockImplementation((_: IHttpOnlyCookie) => {
		return mockHttpOnlyCookie;
	});

	revokeRefreshToken = jest.fn().mockImplementation(() => {
		return;
	});
}
