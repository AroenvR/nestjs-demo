import { HttpExceptionMessages } from "../../common/enums/HttpExceptionMessages";

// TOOD: Make a ResponseDto for this error IHttpErrorObj, since the request builder always returns it

/**
 * An interface which should match most of the minimally standardized error HTTP error response objects.
 * @property status - The HTTP status code of the error response.
 * @property message - A {@link HttpExceptionMessages} enum value representing the error message (set by us).
 */
export interface IHttpErrorObj {
	status: number;
	message: HttpExceptionMessages;
}

/**
 * Interface for HTTP error response objects from our own server.
 * This interface defines the structure of error responses returned by our HTTP exception filters.
 * @property timestamp - The timestamp when the error occurred.
 * @property path - The request path that caused the error.
 */
export interface IHttpErrorResponseObj extends IHttpErrorObj {
	timestamp: number;
	path: string;
}
