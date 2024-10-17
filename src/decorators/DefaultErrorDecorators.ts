import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { HttpExceptionMessages } from '../filters/HttpExceptionMessages';

/**
 * Default error decorators for the application's endpoints
 * @returns Default error decorators for the application
 */
export function DefaultErrorDecorators() {
	return applyDecorators(
		ApiResponse({ status: HttpStatus.BAD_REQUEST, description: HttpExceptionMessages.BAD_REQUEST }),
		ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: HttpExceptionMessages.INTERNAL_SERVER_ERROR }),
		ApiResponse({ status: HttpStatus.NOT_IMPLEMENTED, description: HttpExceptionMessages.NOT_IMPLEMENTED }),
		ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: HttpExceptionMessages.UNAUTHORIZED }),
	);
}
