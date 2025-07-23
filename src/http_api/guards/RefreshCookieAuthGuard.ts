import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { securityConstants } from "../../common/constants/securityConstants";

/**
 * Guard for protecting routes with HTTP-Only Cookie authentication.
 */
@Injectable()
export class RefreshCookieAuthGuard extends AuthGuard(securityConstants.refreshCookieGuardBinding) {}
