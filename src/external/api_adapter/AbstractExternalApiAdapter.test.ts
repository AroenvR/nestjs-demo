import { AbstractExternalApiAdapter } from "./AbstractExternalApiAdapter";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";
import { mockILogger } from "../../__tests__/mocks/mockLogAdapter";
import { MockRequestBuilder } from "../../__tests__/mocks/common/MockRequestBuilder";
import { MockConfigService } from "../../__tests__/mocks/service/MockConfigService";
import { IExternalConfig } from "../IExternalConfig";

/**
 * A Mock implementation of the {@link AbstractExternalApiAdapter} for testing purposes.
 */
class TestApiAdapter extends AbstractExternalApiAdapter {
	public configString(): keyof IServerConfig {
		return "misc";
	}
}

describe("AbstractExternalApiAdapter", () => {
	let adapter: TestApiAdapter;

	const CONFIG: IExternalConfig = {
		ssl: false,
		domain: "foo.be",
		port: 69,
		events: true,
	};

	beforeAll(() => {
		adapter = new TestApiAdapter(mockILogger, new MockRequestBuilder(), new MockConfigService(CONFIG));
	});

	// --------------------------------------------------

	it("should be defined", () => {
		expect(adapter).toBeDefined();
	});

	// --------------------------------------------------

	// yo
});
