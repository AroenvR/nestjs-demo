import { applyDecorators, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HttpExceptionMessages } from '../filters/HttpExceptionMessages';
import { DefaultErrorDecorators } from './DefaultErrorDecorators';

/**
 * Decorator for GET by id endpoint that returns a 200 status code
 * @param entityName The name of the entity
 * @param entityType The type of the entity
 */
export function GetByIdEndpoint(entityName: string, entityType: any) {
	return applyDecorators(
		Get(':id'),
		HttpCode(HttpStatus.OK),
		ApiOperation({ summary: `Find a(n) ${entityName} by id` }),
		ApiResponse({ status: HttpStatus.OK, description: 'Request handled successfully.', type: entityType }),
		ApiResponse({ status: HttpStatus.NOT_FOUND, description: HttpExceptionMessages.NOT_FOUND }),
		DefaultErrorDecorators(),
	);
}
