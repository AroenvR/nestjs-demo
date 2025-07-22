import { applyDecorators, SetMetadata, UseInterceptors } from "@nestjs/common";
import { TransformResponseInterceptor } from "../interceptors/TransformResponseInterceptor";

export const RESPONSE_DTO_KEY = "responseDto";

/**
 * Decorator to apply the TransformResponseInterceptor to controller's endpoints.
 * This decorator is used to transform the response data into an instance of a specified DTO.
 * It can be applied to any controller or controller method that returns data which fits the specified DTO.
 */
export function TransformResponseDto(dto: unknown) {
	return applyDecorators(SetMetadata(RESPONSE_DTO_KEY, dto), UseInterceptors(TransformResponseInterceptor));
}
