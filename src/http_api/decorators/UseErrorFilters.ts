import { applyDecorators, UseFilters } from "@nestjs/common";
import { BadRequestExceptionFilter } from "../filters/bad_request/BadRequestExceptionFilter";
import { HttpExceptionFilter } from "../filters/http_exception/HttpExceptionFilter";
import { NotFoundExceptionFilter } from "../filters/not_found/NotFoundExceptionFilter";
import { NotImplementedExceptionFilter } from "../filters/not_implemented/NotImplementedExceptionFilter";
import { QueryFailedErrorFilter } from "../filters/query_failed/QueryFailedErrorFilter";
import { UnauthorizedExceptionFilter } from "../filters/unauthorized/UnauthorizedExceptionFilter";
import { InternalServerExceptionFilter } from "../filters/internal_server_exception/InternalServerExceptionFilter";

/**
 * Decorator for applying error filters to a controller or method.
 * This decorator applies the following filters:
 * - BadRequestExceptionFilter
 * - HttpExceptionFilter
 * - NotFoundExceptionFilter
 * - NotImplementedExceptionFilter
 * - QueryFailedErrorFilter
 * - UnauthorizedExceptionFilter
 * - InternalServerExceptionFilter
 * @devnote Remember to add an ApiResponse decorator when adding new response codes at src/decorators/DefaultErrorDecorators.ts
 */
export function UseErrorFilters() {
	return applyDecorators(
		UseFilters(
			BadRequestExceptionFilter,
			HttpExceptionFilter,
			NotFoundExceptionFilter,
			NotImplementedExceptionFilter,
			QueryFailedErrorFilter,
			UnauthorizedExceptionFilter,
			InternalServerExceptionFilter,
		),
	);
}

/* 

Started messing with trying to handle each and every error that the server can return with the RequestBuilder
- The AbstractAPIAdapter should return 'null' in stead of the error string, as that's easier to handle.
- Maybe add a 'last response type' variable or something, 
- I'm procrastinating setting up event listening on the External API Adapter but it needs to happen

*/
