import { CorrelationManager } from "./CorrelationManager";
import { ICorrelationManager } from "./ICorrelationManager";

describe("CorrelationManager", () => {
	let correlationManager: ICorrelationManager;

	beforeEach(() => {
		correlationManager = new CorrelationManager();
	});

	afterEach(() => {
		jest.restoreAllMocks();
		jest.resetAllMocks();
	});

	// ------------------------------

	test("should run a callback with a correlation ID", () => {
		const correlationId = "test-correlation-id";

		correlationManager.runWithCorrelationId(correlationId, () => {
			expect(correlationManager.getCorrelationId()).toBe(correlationId);
		});
	});

	// ------------------------------

	test("should return undefined if no correlation ID is set", () => {
		expect(correlationManager.getCorrelationId()).toBeUndefined();
	});

	// ------------------------------

	test("should maintain correlation ID across asynchronous calls", (done) => {
		const correlationId = "async-correlation-id";

		correlationManager.runWithCorrelationId(correlationId, () => {
			setTimeout(() => {
				expect(correlationManager.getCorrelationId()).toBe(correlationId);
				done();
			}, 100);
		});
	});

	// ------------------------------

	test("should not leak correlation ID between different calls", (done) => {
		const correlationId1 = "first-correlation-id";
		const correlationId2 = "second-correlation-id";

		correlationManager.runWithCorrelationId(correlationId1, () => {
			expect(correlationManager.getCorrelationId()).toBe(correlationId1);

			// Run the second correlation ID in a nested context
			correlationManager.runWithCorrelationId(correlationId2, () => {
				expect(correlationManager.getCorrelationId()).toBe(correlationId2);
			});

			// Check the outer context after the inner context
			setImmediate(() => {
				expect(correlationManager.getCorrelationId()).toBe(correlationId1);
				done();
			});
		});
	});

	// ------------------------------

	test("Correlation ID should be correct between logging", () => {
		const correlationId = "log-correlation-id";

		// Spy on console.log
		const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

		const stubFunction = () => {
			console.log(`${correlationManager.getCorrelationId()}: Some log message.`);
		};

		const deeperStubFunction = () => {
			console.log(`${correlationManager.getCorrelationId()}: Some other log message.`);
			stubFunction();
		};

		correlationManager.runWithCorrelationId(correlationId, () => {
			stubFunction();
			expect(consoleLogSpy).toHaveBeenCalledWith(`${correlationId}: Some log message.`);

			// Call the deeper function
			deeperStubFunction();
			expect(consoleLogSpy).toHaveBeenCalledWith(`${correlationId}: Some log message.`);
			expect(consoleLogSpy).toHaveBeenCalledWith(`${correlationId}: Some other log message.`);
		});
	});
});
