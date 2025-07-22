import { SetMetadata } from "@nestjs/common";
import { securityConstants } from "../../common/constants/securityConstants";

/**
 * Decorator to mark a route as public, meaning it does not require authentication.
 * @returns {Function} A decorator function that sets metadata for the route.
 */
export const PublicRoute = () => SetMetadata(securityConstants.IS_PUBLIC_ROUTE, true);
