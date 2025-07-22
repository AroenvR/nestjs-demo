import { applyDecorators, SetMetadata, Sse, Type } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export const SSE_METADATA_KEY = "isSseEndpoint";

/**
 * Decorator for GET endpoints that returns a 200 status code
 * @param entityName The name of the entity
 * @param entityType The type of the entity
 */
export function SseEndpoint(entityName: string, entityType: Type<unknown>) {
	return applyDecorators(
		SetMetadata(SSE_METADATA_KEY, true), // 👈 Used to ensure the TransformResponseDto interceptor skips SSE endpoints.
		Sse("events"),
		ApiOperation({ summary: `Subscribe to ${entityName} events via SSE` }),
		ApiResponse({
			status: 200,
			description: `Publishes ${entityName} events when an INSERT or UPDATE has occurred in the database`,
			type: entityType,
		}),
	);
}
