import { applyDecorators, Get, HttpCode, HttpStatus, Type } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { HttpExceptionMessages } from "../../common/enums/HttpExceptionMessages";
import { DefaultErrorDecorators } from "./DefaultErrorDecorators";

/**
 * Decorator for GET by id endpoint that returns a 200 status code
 * @param entityName The name of the entity
 * @param entityType The type of the entity
 */
export function GetByUuidEndpoint(entityName: string, entityType: Type<unknown>) {
	return applyDecorators(
		Get(":uuid"),
		HttpCode(HttpStatus.OK),
		ApiOperation({ summary: `Find a(n) ${entityName} by uuid` }),
		ApiResponse({ status: HttpStatus.OK, description: "Request handled successfully.", type: entityType }),
		ApiResponse({ status: HttpStatus.NOT_FOUND, description: HttpExceptionMessages.NOT_FOUND }),
		DefaultErrorDecorators(),
	);
}
