import { applyDecorators, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HttpExceptionMessages } from '../filters/HttpExceptionMessages';
import { DefaultErrorDecorators } from './DefaultErrorDecorators';

/**
 * Decorator for DELETE endpoints that returns a 204 status code
 * @param entityName The name of the entity
 */
export function DeleteEndpoint(entityName: string) {
	return applyDecorators(
		Delete(':id'),
		HttpCode(HttpStatus.NO_CONTENT),
		ApiOperation({ summary: `Delete a(n) ${entityName}` }),
		ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Request handled successfully.' }),
		ApiResponse({ status: HttpStatus.NOT_FOUND, description: HttpExceptionMessages.NOT_FOUND }),
		DefaultErrorDecorators(),
	);
}
