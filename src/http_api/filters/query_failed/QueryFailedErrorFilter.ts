import { ArgumentsHost, Catch, HttpStatus } from "@nestjs/common";
import { QueryFailedError } from "typeorm";
import { AbstractHttpFilter } from "../AbstractHttpFilter";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";

@Catch(QueryFailedError)
export class QueryFailedErrorFilter extends AbstractHttpFilter {
	protected status = HttpStatus.INTERNAL_SERVER_ERROR;
	protected message = HttpExceptionMessages.INTERNAL_SERVER_ERROR;

	constructor(logAdapter: WinstonAdapter) {
		super(logAdapter);
	}

	catch(exception: QueryFailedError, host: ArgumentsHost): void {
		if (exception.message.includes("UNIQUE constraint failed")) {
			this.status = HttpStatus.CONFLICT;
			this.message = HttpExceptionMessages.CONFLICT;
		}

		super.catch(exception, host);

		// @Security - This can log sensitive information (database input parameters)
		this.logger.verbose(`QueryFailedError query: ${exception.query} - parameters:`, exception.parameters);
	}
}
