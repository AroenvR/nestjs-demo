import { createMockAppModule } from "../../__tests__/mocks/module/createMockAppModule";
import { UtilityModule } from "./UtilityModule";
import { EncryptionUtils } from "./aes/EncryptionUtils";
import { IRequestBuilder, RequestBuilder } from "./request_builder/RequestBuilder";

describe("UtilityModule", () => {
	let encryptionUtil: EncryptionUtils;
	let requestBuilder: IRequestBuilder;

	beforeEach(async () => {
		const module = await createMockAppModule(UtilityModule);

		encryptionUtil = module.get<EncryptionUtils>(EncryptionUtils);
		requestBuilder = module.get<IRequestBuilder>(RequestBuilder);
	});

	// --------------------------------------------------

	it("Utilities should be defined", () => {
		expect(encryptionUtil).toBeDefined();
		expect(requestBuilder).toBeDefined();
	});
});
