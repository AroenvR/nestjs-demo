import { isTruthy } from 'ts-istruthy';
import { AbstractEntity } from '../../../domain/AbstractEntity';

/**
 * Create a copy of an Entity.
 * @param original Entity to create a copy of.
 * @param keysToSkip Optionally provide an array of keys to skip copying (ID is always skipped).
 * @devnote !!! NEVER USE THIS OUTSIDE OF TESTS !!!
 */
export const copyEntity = <T extends AbstractEntity>(original: T, keysToSkip?: string[]): T => {
	const copy = { id: null };

	for (const [key, val] of Object.entries(original)) {
		if (key === 'id') continue;
		if (isTruthy(keysToSkip) && keysToSkip.includes(key)) continue;

		copy[key] = val;
	}

	// @ts-expect-error: AbstractEntity can't have a null 'id'.
	return copy;
};
