import { Catch, HttpStatus, NotImplementedException } from "@nestjs/common";
import { AbstractHttpFilter } from "../AbstractHttpFilter";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { WinstonAdapter } from "../../../common/utility/logging/adapters/WinstonAdapter";

// !!! Remember to add it to the UseErrorFilters decorator at src/http_api/decorators/UseErrorFilters.ts !!!

@Catch(NotImplementedException)
export class NotImplementedExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.NOT_IMPLEMENTED;
	protected message = HttpExceptionMessages.NOT_IMPLEMENTED;

	constructor(logAdapter: WinstonAdapter) {
		super(logAdapter);
	}
}
