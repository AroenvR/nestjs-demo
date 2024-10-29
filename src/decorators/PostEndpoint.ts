import { applyDecorators, HttpCode, HttpStatus, Post, Type } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DefaultErrorDecorators } from './DefaultErrorDecorators';

/**
 * Decorator for POST endpoints that returns a 201 status code
 * @param entityName The name of the entity
 * @param entityType The type of the entity
 */
export function PostEndpoint(entityName: string, entityType: Type<unknown>) {
	return applyDecorators(
		Post(),
		HttpCode(HttpStatus.CREATED),
		ApiOperation({ summary: `Create a new ${entityName}` }),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: `The ${entityName} was successfully created.`,
			type: entityType,
		}),
		DefaultErrorDecorators(),
	);
}
