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
	// Override canActivate to never throw an exception
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		// Always allow the request to proceed
		try {
			super.canActivate(context);
		} catch (err) {
			// Ignore the error
		}

		// this.tryAuthentication(context);
		return true;
	}

	// // private tryAuthentication(context: ExecutionContext) {
	// //     // Try to authenticate but don't block if it fails
	// //     super.canActivate(context)
	// //       .then(result => {/* success - user will be attached */})
	// //       .catch(err => {/* fail silently */});
	// // }

	// Override handleRequest to never throw
	handleRequest(err, user, info, context) {
		// Always return the user (or null) without throwing
		return user || null;
	}
}
