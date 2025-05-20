import { Catch, HttpStatus, NotImplementedException } from "@nestjs/common";
import { AbstractHttpFilter } from "../AbstractHttpFilter";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";

@Catch(NotImplementedException)
export class NotImplementedExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.NOT_IMPLEMENTED;
	protected message = HttpExceptionMessages.NOT_IMPLEMENTED;

	constructor(logAdapter: WinstonAdapter) {
		super(logAdapter);
	}
}
