import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { TransformResponseInterceptor } from "../interceptors/TransformResponseInterceptor";

/**
 * Decorator to apply the TransformResponseInterceptor to a controller method.
 * This decorator is used to transform the response data into an instance of a specified DTO.
 * It can be applied to any controller method that returns a DTO.
 */
export function TransformResponseDto(dto: unknown) {
	return applyDecorators(UseInterceptors(new TransformResponseInterceptor(dto)));
}
