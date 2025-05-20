/**
 * Construct an array of JavaScript considered 'falsy' values.
 * Optionally add strings of certain lengths for validation purposes.
 * Optionally remove the 'null' and 'undefined' values for validating optional values.
 * @param min Add a string with a minimum length requirement.
 * @param max Add a string with a maximum length requirement.
 * @param noNullOrUndefined Remove 'null' and 'undefined'. Defaults to false.
 * @returns An array of unkown 'falsy' values.
 */
export const falsyValues = (min?: number, max?: number, noNullOrUndefined: boolean = false): unknown[] => {
	const values = ["", 0, -100, true, false, [], {}, Symbol("")];

	if (min === 0) values.splice(values.indexOf(""), 1);
	if (min) values.push("a".repeat(min - 1));
	if (max) values.push("b".repeat(max + 1));

	if (!noNullOrUndefined) {
		values.push(null);
		values.push(undefined);
	}

	return values;
};
