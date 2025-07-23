/**
 * `Authorization: Bearer <token>` constants.
 */
const bearerAccessTokenConstants = {
	bearerAccessTokenEnvVar: "BEARER_TOKEN_SECRET",
	bearerTokenBinding: "d8dd9fcf9963e43e4f27c9b5158ba5aee3c884efd7093b4967b11d082e2943f0",
};

/**
 * Refresh HTTP-Only Cookie constants.
 */
const httpOnlyRefreshTokenConstants = {
	refreshCookieEnvVar: "REFRESH_COOKIE_SECRET",
	refreshCookieString: "refresh_token",
	refreshCookieGuardBinding: "6b78de9fbde0c214d5d6e9e637ad8d3ca1f052f2608185866a1a765a45e2977c",
};

/**
 * Access HTTP-Only Cookie constants.
 */
const httpOnlyAccessCookieConstants = {
	accessCookieEnvVar: "ACCESS_COOKIE_SECRET",
	accessCookieString: "access_cookie",
	accessCookieBinding: "fe7853e9d8ad2971fdb7e9acc9444b703f0c9f5cc13b3daba81d166bd90c195e",
};

/**
 * Swagger authentication constants.
 */
const swaggerApiKeyConstants = {
	swaggerEnvVar: "SWAG_API_KEY",
	swaggerHeader: "X-Swagger-API-Key",
	swaggerAuthGuardBinding: "00cb46121fee658b79c95ca07c5827de7ed21d82a6b1719a2f032731c0e20d3c",
};

/**
 * JWKS constants.
 */
const jwksConstants = {
	jwksBinding: "81b48bbc56d0f1862672097b03c65468370ca1ca210aa95d806473c32e75894d",
};

/**
 * Security-related constants for the application.
 */
export const securityConstants = {
	IS_PUBLIC_ROUTE: "isPublicRoute",
	...bearerAccessTokenConstants,
	...httpOnlyRefreshTokenConstants,
	...httpOnlyAccessCookieConstants,
	...swaggerApiKeyConstants,
	...jwksConstants,
};
