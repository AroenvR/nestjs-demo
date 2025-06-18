/**
 * TAppStatusMessage is used to indicate the current status of the application.
 * It is typically used in application status monitoring and reporting.
 *
 * - "starting": The application is in the process of starting up.
 * - "listening": The application is running and ready to accept requests.
 * - "blocked": The application is currently blocked and not processing requests.
 * - "stopping": The application is in the process of shutting down.
 * - "error": The application has encountered an error and is not functioning properly.
 */
export type TAppStatusMessage = "starting" | "listening" | "blocked" | "stopping" | "error";

/**
 * Array of all possible TAppStatusMessage values.
 * Generally used for JSON schema validation or type checking.
 */
export const TAppStatusMessageValues: TAppStatusMessage[] = ["starting", "listening", "blocked", "stopping", "error"];
