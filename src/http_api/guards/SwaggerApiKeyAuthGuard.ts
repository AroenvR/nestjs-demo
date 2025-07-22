import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { securityConstants } from "../../common/constants/securityConstants";

/**
 * A guard that checks for a valid API key in the request headers.
 * This is used to secure Swagger endpoints.
 */
@Injectable()
export class SwaggerApiKeyAuthGuard extends AuthGuard(securityConstants.swaggerAuthGuardBinding) {}
