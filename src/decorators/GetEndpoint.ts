import { applyDecorators, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DefaultErrorDecorators } from './DefaultErrorDecorators';

/**
 * Decorator for GET endpoints that returns a 200 status code
 * @param entityName The name of the entity
 * @param entityType The type of the entity
 */
export function GetEndpoint(entityName: string, entityType: any) {
	return applyDecorators(
		Get(),
		HttpCode(HttpStatus.OK),
		ApiOperation({ summary: `Find all ${entityName}s` }),
		ApiResponse({ status: HttpStatus.OK, description: 'Request handled successfully.', type: entityType, isArray: true }),
		DefaultErrorDecorators(),
	);
}
