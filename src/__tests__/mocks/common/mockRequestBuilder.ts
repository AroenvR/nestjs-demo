import { IRequestBuilder, RequestBuilder } from "../../../common/utility/request_builder/RequestBuilder";
import { WinstonAdapter } from "src/infrastructure/logging/adapters/WinstonAdapter";

/**
 * A Mock object for the {@link RequestBuilder} object to be used in testing.
 */
export class MockRequestBuilder extends RequestBuilder {
	constructor() {
		// You can optionally provide a real WinstonAdapter or mock it
		const mockLogger: any = {
			debug: jest.fn(),
			verbose: jest.fn(),
			info: jest.fn(),
			log: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
			critical: jest.fn(),
			correlationManager: { runWithCorrelationId: jest.fn((_, cb) => cb()) },
		};

		const fakeLogAdapter = {
			getPrefixedLogger: jest.fn().mockReturnValue(mockLogger),
		} as unknown as WinstonAdapter;

		super(fakeLogAdapter);
	}

	execute = jest.fn().mockResolvedValue("mocked response");

	build = jest.fn().mockReturnValue({
		method: "GET",
		useSsl: true,
		port: 443,
		domain: "example.com",
		endpoint: "/test",
		body: null,
		headers: { "Content-Type": "application/json" },
		responseType: "json",
		execute: this.execute,
	});
}

/**
 * A Mock object for the {@link IRequestBuilder} object to be used in testing.
 */
export const mockRequestBuilder: jest.Mocked<IRequestBuilder> = {
	method: "GET",
	useSsl: true,
	port: 443,
	domain: "example.com",
	endpoint: "/test",
	body: null,
	headers: { "Content-Type": "application/json" },
	responseType: "json",

	execute: jest.fn(),

	build: jest.fn(),

	setMethod: jest.fn().mockReturnThis(),
	setUseSsl: jest.fn().mockReturnThis(),
	setPort: jest.fn().mockReturnThis(),
	setDomain: jest.fn().mockReturnThis(),
	setEndpoint: jest.fn().mockReturnThis(),
	setBody: jest.fn().mockReturnThis(),
	setHeaders: jest.fn().mockReturnThis(),
	setResponseType: jest.fn().mockReturnThis(),
};
