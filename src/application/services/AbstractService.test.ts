import { NotImplementedException } from "@nestjs/common";
import { AbstractService } from "./AbstractService";
import { WinstonAdapter } from "../../infrastructure/logging/adapters/WinstonAdapter";
import { serverConfig } from "../../infrastructure/configuration/serverConfig";
import { CorrelationManager } from "../../infrastructure/logging/correlation/CorrelationManager";
import { UserEntity } from "../../domain/user/UserEntity";
import { mockPlainTextBearerToken } from "../../__tests__/mocks/mockJwt";

describe("AbstractService", () => {
	it("Throws NotImplementedException for all unimplemented methods.", async () => {
		const adapter = new WinstonAdapter(serverConfig().logging, new CorrelationManager());

		class MockService extends AbstractService<UserEntity> {}
		const service = new MockService(null, null, adapter);

		await expect(service.create(null)).rejects.toThrow(NotImplementedException);
		await expect(service.findAll()).rejects.toThrow(NotImplementedException);
		await expect(service.findOne(null)).rejects.toThrow(NotImplementedException);
		await expect(service.update(null, null)).rejects.toThrow(NotImplementedException);
		await expect(service.remove(null)).rejects.toThrow(NotImplementedException);
		await expect(service.observe(mockPlainTextBearerToken)).rejects.toThrow(NotImplementedException);
		await expect(service.emit(null)).rejects.toThrow(NotImplementedException);
	});
});
