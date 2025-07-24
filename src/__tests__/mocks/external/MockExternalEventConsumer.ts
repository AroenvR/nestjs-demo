import { ExternalEventConsumer } from "../../../external/events/ExternalEventConsumer";
import { WinstonAdapter } from "../../../common/utility/logging/adapters/WinstonAdapter";

/**
 * Mock implementation of {@link ExternalEventConsumer} for testing purposes.
 */
export class MockExternalEventConsumer extends ExternalEventConsumer {
	constructor(logAdapter: WinstonAdapter) {
		super(logAdapter);
	}
}
