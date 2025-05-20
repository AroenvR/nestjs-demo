import { NotImplementedException } from "@nestjs/common";
import { serverConfig } from "../infrastructure/configuration/serverConfig";
import { WinstonAdapter } from "../infrastructure/logging/adapters/WinstonAdapter";
import { CorrelationManager } from "../infrastructure/logging/correlation/CorrelationManager";
import { AbstractEntityManager } from "./AbstractEntityManager";

describe("AbstractEntityManager", () => {
	it("Throws NotImplementedException for all unimplemented methods.", async () => {
		const adapter = new WinstonAdapter(serverConfig().logging, new CorrelationManager());
		const manager = new AbstractEntityManager(adapter);

		await expect(manager.create(null)).rejects.toThrow(NotImplementedException);
	});
});
