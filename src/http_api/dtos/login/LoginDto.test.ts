import { MockCreateLoginDto } from "../../../__tests__/mocks/dto/MockLoginDto";
import { CreateLoginDto } from "./CreateLoginDto";

describe("LoginDTO", () => {
	let createDto: CreateLoginDto;

	beforeEach(() => {
		createDto = MockCreateLoginDto.get();
	});

	// --------------------------------------------------

	it("Has a password field", () => {
		expect(createDto.password).toBeDefined();
	});
});
