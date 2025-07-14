import { AppStatusResponseDto } from "./AppStatusResponseDto";

describe("AppStatus Response DTO", () => {
	it("Can be created with a the 'starting' status", () => {
		const responseDto = AppStatusResponseDto.create("starting");
		expect(responseDto.status).toEqual("starting");
	});

	// --------------------------------------------------

	it("Can be created with a the 'listening' status", () => {
		const responseDto = AppStatusResponseDto.create("listening");
		expect(responseDto.status).toEqual("listening");
	});

	// --------------------------------------------------

	it("Can be created with a the 'error' status", () => {
		const responseDto = AppStatusResponseDto.create("error");
		expect(responseDto.status).toEqual("error");
	});

	// --------------------------------------------------

	it("Can be created with a the 'blocked' status", () => {
		const responseDto = AppStatusResponseDto.create("blocked");
		expect(responseDto.status).toEqual("blocked");
	});

	// --------------------------------------------------

	it("Can be created with a the 'stopping' status", () => {
		const responseDto = AppStatusResponseDto.create("stopping");
		expect(responseDto.status).toEqual("stopping");
	});
});
