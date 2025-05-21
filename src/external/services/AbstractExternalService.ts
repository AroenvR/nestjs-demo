import { Injectable, NotImplementedException } from "@nestjs/common";
import { ILogger, IPrefixedLogger } from "../../infrastructure/logging/ILogger";

// EXAMPLE IMPLEMENTATION
// export class TestService extends AbstractExternalService {
// 	constructor(
// 		@Inject(WinstonAdapter)
// 		protected readonly logAdapter: WinstonAdapter,
// 	) {
// 		super(logAdapter);
// 	}

// 	public async handleEvent(data: unknown) {

// 	}
// }

/**
 * AbstractExternalService is an abstract class that provides a template for external services.
 * It is meant to be extended by other service classes that handle specific external events.
 */
@Injectable()
export class AbstractExternalService {
	protected readonly name: string;
	protected logger: ILogger;

	constructor(protected readonly logAdapter: IPrefixedLogger) {
		this.name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 * Handles the event data received from the external service.
	 * This method should be implemented by subclasses to handle specific event data.
	 * @param _ The event data to handle.
	 */
	public async handleEvent(_: unknown) {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}
}
