import { Catch, HttpStatus, InternalServerErrorException } from "@nestjs/common";
import { AbstractHttpFilter } from "../AbstractHttpFilter";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";

// !!! Remember to add it to the UseErrorFilters decorator at src/http_api/decorators/UseErrorFilters.ts !!!

@Catch(InternalServerErrorException)
export class InternalServerExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.INTERNAL_SERVER_ERROR;
	protected message = HttpExceptionMessages.INTERNAL_SERVER_ERROR;

	constructor(logAdapter: WinstonAdapter) {
		super(logAdapter);
	}
}
