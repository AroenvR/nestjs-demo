import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { securityConstants } from "../../common/constants/securityConstants";

/**
 * Guard for protecting routes with JWT authentication.
 * This guard uses the JWT strategy to validate the token.
 */
@Injectable()
export class PassportJwtAuthGuard extends AuthGuard(securityConstants.jwtAuthGuardBinding) {}
