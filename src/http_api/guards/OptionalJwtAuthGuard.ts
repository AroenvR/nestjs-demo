import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Optional JWT authentication guard for public routes.
 * This guard does not throw an error if the JWT is missing or invalid.
 * Instead, it simply returns the user object if available.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('optional-jwt') {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		try {
			super.canActivate(context);
		} catch (err) {
			// Ignore the error as we want the code to proceed even if the JWT is missing or invalid
			// This way, if there is a JWT, the controller still has access to it.

			console.debug(`${this.constructor.name}: JWT not found or invalid. Proceeding without it:`, err);
		}

		return true;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	handleRequest(err, user, info, context) {
		// If there is a JWT, we want to pass it to the controller.
		// If there is no JWT, we don't want to throw but simply pass null.

		return user || null;
	}
}
