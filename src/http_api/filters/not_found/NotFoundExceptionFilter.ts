import { Catch, HttpStatus, NotFoundException } from "@nestjs/common";
import { AbstractHttpFilter } from "../AbstractHttpFilter";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { WinstonAdapter } from "../../../common/utility/logging/adapters/WinstonAdapter";

// !!! Remember to add it to the UseErrorFilters decorator at src/http_api/decorators/UseErrorFilters.ts !!!

@Catch(NotFoundException)
export class NotFoundExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.NOT_FOUND;
	protected message = HttpExceptionMessages.NOT_FOUND;

	constructor(logAdapter: WinstonAdapter) {
		super(logAdapter);
	}
}
