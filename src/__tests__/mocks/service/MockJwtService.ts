/**
 * Mocks a JWT service with a signAsync method.
 * This is used to simulate the behavior of a JWT service in tests.
 */
export class MockJwtService {
	signAsync = jest.fn().mockImplementation(() => Promise.resolve('mock.jwt.token'));
}
