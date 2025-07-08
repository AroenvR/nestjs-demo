/**
 * Spy on the global.fetch API and return a mock response for testing purposes.
 * @param response Optional response to return when fetch is called. If not provided, it defaults to an empty object.
 * @returns A jest spy on the global fetch function that resolves to a mock Response object.
 */
export const mockAndSpyFetchRequest = (response?: unknown) => {
	const responseProm = new Promise<Response>((resolve) => {
		const mockResponseObject = {
			ok: true,
			arrayBuffer: jest.fn().mockResolvedValue(response),
			blob: jest.fn().mockResolvedValue(response),
			json: jest.fn().mockResolvedValue(response),
			text: jest.fn().mockResolvedValue(response),
		} as unknown as Response;

		if (typeof response !== "object") resolve(mockResponseObject);

		if (typeof response === "object") {
			if ("ok" in response && typeof response.ok === "boolean") {
				// @ts-expect-error: Accessing a readonly property.
				mockResponseObject["ok"] = response.ok;
			}

			if ("status" in response && typeof response.status === "number") {
				// @ts-expect-error: Accessing a readonly property.
				mockResponseObject["status"] = response.status;
			}

			if ("statusText" in response && typeof response.statusText === "string") {
				// @ts-expect-error: Accessing a readonly property.
				mockResponseObject["statusText"] = response.statusText;
			}
		}

		resolve(mockResponseObject);
	});

	return jest.spyOn(global, "fetch").mockResolvedValue(responseProm);
};
