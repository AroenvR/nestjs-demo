import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, InternalServerErrorException } from "@nestjs/common";

/**
 * An interceptor that transforms the response data into an instance of a specified class.
 * This interceptor is designed to be used with NestJS controllers to ensure that the response data
 * conforms to a specific structure defined by the target class.
 * It can handle both single objects and arrays of objects, transforming each item into an instance of the target class.
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
	constructor(private readonly targetClass: any) {}

	intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(
			map((data) => {
				if (!data || !this.targetClass) return data;

				// Handle arrays
				if (Array.isArray(data)) {
					return data.map((item) => this.transformSingleItem(item));
				}

				// Handle single objects
				return this.transformSingleItem(data);
			}),
		);
	}

	/**
	 * Transforms a single item of data into an instance of the target class.
	 * @param data The data to transform, which should be an object or a primitive value.
	 * @returns An instance of the target class created from the provided data.
	 */
	private transformSingleItem(data: any): any {
		// Check if the target class has a static 'create' method
		if (typeof this.targetClass.create !== "function") {
			throw new InternalServerErrorException(
				`${this.constructor.name}: No static 'create' method found on target class ${this.targetClass.name}.`,
			);
		}

		return this.targetClass.create(data);
	}
}
