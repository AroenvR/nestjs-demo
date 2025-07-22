/**
 * Security-related constants for the application.
 */
export const securityConstants = {
	httpOnlyCookieEnvVar: "HTTP_COOKIE_SECRET",
	httpOnlyCookieGuardBinding: "http-only_cookie_binding",
	bearerAccessTokenEnvVar: "BEARER_TOKEN_SECRET",
	bearerTokenBinding: "bearer_access_token_binding",
	jwksBinding: "JWKS_binding",
	refreshCookieString: "refresh_token",
	jwtAuthGuardBinding: "jwt",
	swaggerEnvVar: "SWAG_API_KEY",
	swaggerAuthGuardBinding: "swagger-api-auth",
	swaggerHeader: "X-Swagger-API-Key",
	IS_PUBLIC_ROUTE: "isPublicRoute",
	accessTokenKey: "ACCESS_TOKEN_ENCRYPTION_KEY",
};
