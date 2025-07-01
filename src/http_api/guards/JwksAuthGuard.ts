import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { securityConstants } from "../../common/constants/securityConstants";

/**
 * Guard for protecting routes with JSON Web Key Sets.
 * JWKS are generally provided by an external OIDC server.
 */
@Injectable()
export class JwksAuthGuard extends AuthGuard(securityConstants.jwksBinding) {}
