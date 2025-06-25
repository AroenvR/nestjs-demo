import { ModuleRef, Reflector } from "@nestjs/core";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { securityConstants } from "../../common/constants/securityConstants";
import { PassportJwtAuthGuard } from "./PassportJwtAuthGuard";
import { SwaggerApiKeyAuthGuard } from "./SwaggerApiKeyAuthGuard";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";

/**
 * A guard that chains multiple authentication strategies.
 * It first checks if the route is public, and if not,
 * it attempts to authenticate using the Swagger API key guard and then the JWT guard.
 * If all guards fail, it throws an UnauthorizedException.
 */
@Injectable()
export class CompositeAuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly moduleRef: ModuleRef,
		private readonly configService: ConfigService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(securityConstants.IS_PUBLIC_ROUTE, [context.getHandler(), context.getClass()]);
		const request = context.switchToHttp().getRequest();

		// if (isPublic) {
		// 	console.log("Route is public, allowing access.");
		// 	return true;
		// }

		if (isPublic) {
			// Try to decode JWT if present, but don't block access
			const token = request.cookies?.jwt || request.headers["authorization"]?.replace("Bearer ", "");
			if (token) request.user = token;

			console.log("Route is public, allowing access.");
			return true;
		}

		for (const guard of this.getGuards()) {
			try {
				const result = await guard.canActivate(context);
				if (result) return true;

				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (error) {
				// Continue to next guard if current one fails
			}
		}

		// All enabled guards failed
		throw new UnauthorizedException(`${this.constructor.name}: No valid authentication credentials found.`);
	}

	/**
	 * Retrieves the enabled authentication guards based on the server configuration.
	 * This method checks the security configuration to determine which guards are enabled.
	 * @returns An array of enabled authentication guards.
	 * @throws Error if the security configuration is not defined.
	 */
	private getGuards(): CanActivate[] {
		const config = this.configService.get<IServerConfig["security"]>("security");
		if (!config) throw new Error("Security configuration is not defined");

		const enabledGuards = [];

		if (config.cookie.enabled) enabledGuards.push(this.moduleRef.get(PassportJwtAuthGuard, { strict: false }));
		if (config.bearer.enabled) enabledGuards.push(this.moduleRef.get(SwaggerApiKeyAuthGuard, { strict: false }));

		return enabledGuards;
	}
}
