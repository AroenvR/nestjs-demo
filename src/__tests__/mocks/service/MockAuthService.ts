import { CreateLoginDto } from "../../../http_api/dtos/login/CreateLoginDto";
import { AbstractEntity } from "../../../domain/AbstractEntity";

/**
 * Mocks a service that provides authentication functionalities.
 */
export class MockAuthService {
	constructor(protected createResponseDto: () => AbstractEntity) {}

	authenticate = jest.fn().mockImplementation((_: CreateLoginDto) => {
		return Promise.resolve(this.createResponseDto());
	});

	findUserByCookie = jest.fn().mockImplementation((_: CreateLoginDto) => {
		return Promise.resolve(this.createResponseDto());
	});
}
