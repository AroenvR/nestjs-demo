/**
 * Spy on the global.fetch API and return a mock response for testing purposes.
 * @param response Optional response to return when fetch is called. If not provided, it defaults to an empty object.
 * @returns A jest spy on the global fetch function that resolves to a mock Response object.
 */
export const fetchRequestSpy = (response?: unknown) => {
	const responseProm = new Promise<Response>((resolve) => {
		resolve({
			ok: true,
			arrayBuffer: jest.fn().mockResolvedValue(response),
			blob: jest.fn().mockResolvedValue(response),
			json: jest.fn().mockResolvedValue(response),
			text: jest.fn().mockResolvedValue(response),
		} as unknown as Response);
	});

	return jest.spyOn(global, "fetch").mockResolvedValue(responseProm);
};
