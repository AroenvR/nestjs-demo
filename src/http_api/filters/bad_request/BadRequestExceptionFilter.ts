import { Catch, BadRequestException, HttpStatus } from "@nestjs/common";
import { AbstractHttpFilter } from "../AbstractHttpFilter";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";

// !!! Remember to add it to the UseErrorFilters decorator at src/http_api/decorators/UseErrorFilters.ts !!!

@Catch(BadRequestException)
export class BadRequestExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.BAD_REQUEST;
	protected message = HttpExceptionMessages.BAD_REQUEST;

	constructor(logAdapter: WinstonAdapter) {
		super(logAdapter);
	}
}
