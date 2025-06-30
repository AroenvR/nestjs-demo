import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { securityConstants } from "../../common/constants/securityConstants";

/**
 * Guard for protecting routes with Bearer access token authentication.
 */
@Injectable()
export class BearerTokenAuthGuard extends AuthGuard(securityConstants.bearerTokenBinding) {}
