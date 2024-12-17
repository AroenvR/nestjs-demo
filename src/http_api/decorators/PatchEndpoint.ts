import { applyDecorators, HttpCode, HttpStatus, Patch, Type } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HttpExceptionMessages } from '../../common/enums/HttpExceptionMessages';
import { DefaultErrorDecorators } from './DefaultErrorDecorators';

/**
 * Decorator for PATCH endpoints that returns a 201 status code
 * @param entityName The name of the entity
 * @param entityType The type of the entity
 */
export function PatchEndpoint(entityName: string, entityType: Type<unknown>) {
	return applyDecorators(
		Patch(':id'),
		HttpCode(HttpStatus.OK),
		ApiOperation({ summary: `Update an existing ${entityName}` }),
		ApiResponse({ status: HttpStatus.OK, description: 'Request handled successfully.', type: entityType }),
		ApiResponse({ status: HttpStatus.NOT_FOUND, description: HttpExceptionMessages.NOT_FOUND }),
		ApiResponse({ status: HttpStatus.CONFLICT, description: HttpExceptionMessages.CONFLICT }),
		DefaultErrorDecorators(),
	);
}
