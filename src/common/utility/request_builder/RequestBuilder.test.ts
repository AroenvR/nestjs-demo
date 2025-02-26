import { createMockAppModule } from '../../../__tests__/mocks/module/createMockAppModule';
import { RequestBuilder, IRequestBuilder } from './RequestBuilder';
import { UtilityModule } from '../UtilityModule';

describe('RequestBuilder', () => {
	let requestBuilder: IRequestBuilder;

	beforeEach(async () => {
		const module = await createMockAppModule(UtilityModule);
		requestBuilder = module.get<IRequestBuilder>(RequestBuilder);

		// Ensure global.fetch is a Jest mock function
		global.fetch = jest.fn();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	// --------------------------------------------------

	it('Should build the request with provided values', () => {
		const built = requestBuilder
			.setMethod('POST')
			.setUseSsl(true)
			.setPort(443)
			.setDomain('example.com')
			.setEndpoint('/api/test')
			.setBody({ key: 'value' })
			.setHeaders({ 'Content-Type': 'application/json' })
			.setResponseType('json')
			.build();

		expect(built.method).toEqual('POST');
		expect(built.useSsl).toEqual(true);
		expect(built.port).toEqual(443);
		expect(built.domain).toEqual('example.com');
		expect(built.endpoint).toEqual('/api/test');
		expect(built.body).toEqual({ key: 'value' });
		expect(built.headers).toEqual({ 'Content-Type': 'application/json' });
		expect(built.responseType).toEqual('json');
	});

	// --------------------------------------------------

	it('Should execute the request and then reset builder state', async () => {
		const built = requestBuilder
			.setMethod('POST')
			.setUseSsl(true)
			.setPort(443)
			.setDomain('example.com')
			.setEndpoint('/api/test')
			.setBody('test body')
			.setHeaders({ 'Content-Type': 'text/plain' })
			.setResponseType('json')
			.build();

		// Prepare a mock fetch response
		const mockJsonResponse = { success: true };
		const mockResponse = {
			ok: true,
			json: jest.fn().mockResolvedValue(mockJsonResponse),
		};
		(global.fetch as jest.Mock).mockResolvedValue(mockResponse);

		// Execute the request
		const response = await built.execute();
		expect(response).toEqual(mockJsonResponse);

		// After execution, the builder should be reset to default values.
		expect(requestBuilder.method).toBe('GET');
		expect(requestBuilder.useSsl).toBe(false);
		expect(requestBuilder.port).toBeNull();
		expect(() => requestBuilder.domain).toThrow();
		expect(requestBuilder.endpoint).toBeNull();
		expect(requestBuilder.body).toBeNull();
		expect(requestBuilder.headers).toEqual({});
		expect(requestBuilder.responseType).toBe('json');
	});

	// --------------------------------------------------

	it('Should throw an error if response type is unsupported', async () => {
		const built = requestBuilder
			.setMethod('GET')
			.setUseSsl(false)
			.setDomain('example.com')
			.setEndpoint('/api/test')
			.setHeaders({ 'Content-Type': 'application/json' })
			.setResponseType('json')
			.build();

		// Prepare a mock response that is not ok.
		const mockResponse = {
			ok: false,
			status: 400,
			statusText: 'Bad Request',
		};
		(global.fetch as jest.Mock).mockResolvedValue(mockResponse);

		await expect(built.execute()).rejects.toThrow();
	});
});
