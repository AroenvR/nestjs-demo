import { ConfigService } from "@nestjs/config";
import { IServerConfig } from "../../../infrastructure/configuration/IServerConfig";
import { serverConfig } from "../../../infrastructure/configuration/serverConfig";

/**
 * Mock implementation of the ConfigService for testing purposes.
 * @devnote if no override value is given, this class behaves like the real ConfigService with the serverConfig object.
 * @devnote if an override value is given, the get method will always return that value.
 */
export class MockConfigService extends ConfigService<IServerConfig, false> {
	private readonly forceValue: Record<string, unknown> | Record<string, unknown>[] | undefined = undefined;

	constructor(overrideValue?: Record<string, unknown> | Record<string, unknown>[]) {
		// Call super with a default config so that parent methods still work
		super(serverConfig());
		this.forceValue = overrideValue;
	}

	/**
	 * Overrides the get method:
	 * - If an override value is given to the constructor, always return that
	 * - Otherwise, behave like the real ConfigService with default config
	 */
	override get(key: keyof IServerConfig): any {
		if (this.forceValue !== undefined) {
			return this.forceValue;
		}

		return super.get(key);
	}
}
