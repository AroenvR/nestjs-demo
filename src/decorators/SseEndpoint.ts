import { applyDecorators, Sse, Type } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

/**
 * Decorator for GET endpoints that returns a 200 status code
 * @param entityName The name of the entity
 * @param entityType The type of the entity
 */
export function SseEndpoint(entityName: string, entityType: Type<unknown>) {
    return applyDecorators(
        Sse('events'),
        ApiOperation({ summary: `Subscribe to ${entityName} events via SSE` }),
        ApiResponse({
            status: 200,
            description: `Publishes ${entityName} events when an INSERT or UPDATE has occurred in the database`,
            type: entityType,
        })
    );
}