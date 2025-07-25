import { PQTaskManager } from "./PQTaskManager";
import { MockUtilities } from "../../../__tests__/mocks/common/MockUtilities";
import { Utilities } from "../Utilities";

describe("PQTaskManager.Unit", () => {
	let utilities: Utilities;
	let manager: PQTaskManager;

	beforeAll(() => {
		utilities = new MockUtilities();
	});

	beforeEach(() => {
		manager = new PQTaskManager(utilities.configService, utilities.logAdapter);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(manager).toBeDefined();
		expect(manager.isIdle).toBe(true);
		expect(manager.isPaused).toBe(false);
		expect(manager.isShuttingDown).toBe(false);
	});
});
