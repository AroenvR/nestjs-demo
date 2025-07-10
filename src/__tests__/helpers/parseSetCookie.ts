/**
 * Parses a Set-Cookie header string into a structured object for testing.
 * @param cookieStr The raw Set-Cookie header string.
 * @returns An object containing parsed fields like name, JWT value, expiration, flags, etc.
 */
export function parseSetCookie(cookieStr: string) {
	const parts = cookieStr.split(";").map((part) => part.trim());

	// The first part is always "name=value"
	const [namePart, ...attributeParts] = parts;
	const [name, jwt] = namePart.split("=");

	const cookie: {
		name: string;
		jwt: string;
		maxAge?: number;
		expires?: number;
		httpOnly: boolean;
		sameSite?: string;
	} = {
		name,
		jwt,
		httpOnly: false,
	};

	for (const attr of attributeParts) {
		const [key, value] = attr.split("=");

		switch (key.toLowerCase()) {
			case "max-age":
				cookie.maxAge = parseInt(value, 10);
				break;
			case "expires":
				cookie.expires = new Date(value).getTime();
				break;
			case "httponly":
				cookie.httpOnly = true;
				break;
			case "samesite":
				cookie.sameSite = value;
				break;
			// Add more cases if needed (e.g., Path, Secure, etc.)
		}
	}

	return cookie;
}
