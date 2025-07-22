import { Catch, HttpStatus, UnauthorizedException } from "@nestjs/common";
import { AbstractHttpFilter } from "../AbstractHttpFilter";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";

// !!! Remember to add it to the UseErrorFilters decorator at src/http_api/decorators/UseErrorFilters.ts !!!

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.UNAUTHORIZED;
	protected message = HttpExceptionMessages.UNAUTHORIZED;

	constructor(logAdapter: WinstonAdapter) {
		super(logAdapter);
	}
}
