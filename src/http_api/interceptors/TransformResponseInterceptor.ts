import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, InternalServerErrorException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SSE_METADATA_KEY } from "../decorators/SseEndpoint";
import { RESPONSE_DTO_KEY } from "../decorators/TransformResponseDto";

/**
 * An interceptor that transforms the response data into an instance of a specified class.
 * This interceptor is designed to be used with NestJS controllers to ensure that the response data
 * conforms to a specific structure defined by the target class.
 * It can handle both single objects and arrays of objects, transforming each item into an instance of the target class.
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
	constructor(private readonly reflector: Reflector) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const isSse = this.reflector.get<boolean>(SSE_METADATA_KEY, context.getHandler());
		if (isSse) return next.handle();

		const handler = context.getHandler();
		const classRef = context.getClass();

		const dto = this.reflector.get(RESPONSE_DTO_KEY, handler) ?? this.reflector.get(RESPONSE_DTO_KEY, classRef);
		if (!dto) return next.handle();

		return next.handle().pipe(
			map((data) => {
				if (!data || !dto) return data;
				if (Array.isArray(data)) return data.map((item) => this.transformSingleItem(item, dto));
				return this.transformSingleItem(data, dto);
			}),
		);
	}

	/**
	 * Transforms a single item of data into an instance of the target class.
	 * @param data The data to transform, which should be an object or a primitive value.
	 * @returns An instance of the target class created from the provided data.
	 */
	private transformSingleItem(data: any, dtoClass: any): any {
		if (typeof dtoClass.create !== "function") {
			throw new InternalServerErrorException(`${this.constructor.name}: No static 'create' method found on target class ${dtoClass.name}.`);
		}

		if (data.isDto === true) return data;
		return dtoClass.create(data);
	}
}
