import { serverConfig } from "../../../infrastructure/configuration/serverConfig";

/**
 * Mock implementation of the ConfigService for testing purposes.
 */
export class MockConfigService {
	get(key: string) {
		switch (key) {
			case "security":
				return serverConfig().security;

			case "logging":
				return serverConfig().logging;

			case "database":
				return serverConfig().database;

			default:
				return null;
		}
	}
}
