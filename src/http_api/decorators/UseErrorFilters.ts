import { applyDecorators, UseFilters } from '@nestjs/common';
import { BadRequestExceptionFilter } from '../filters/bad_request/BadRequestExceptionFilter';
import { HttpExceptionFilter } from '../filters/http_exception/HttpExceptionFilter';
import { NotFoundExceptionFilter } from '../filters/not_found/NotFoundExceptionFilter';
import { NotImplementedExceptionFilter } from '../filters/not_implemented/NotImplementedExceptionFilter';
import { QueryFailedErrorFilter } from '../filters/query_failed/QueryFailedErrorFilter';
import { UnauthorizedExceptionFilter } from '../filters/unauthorized/UnauthorizedExceptionFilter';

/**
 * Decorator for applying error filters to a controller or method.
 * This decorator applies the following filters:
 * - BadRequestExceptionFilter
 * - HttpExceptionFilter
 * - NotFoundExceptionFilter
 * - NotImplementedExceptionFilter
 * - QueryFailedErrorFilter
 * - UnauthorizedExceptionFilter
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
		),
	);
}
