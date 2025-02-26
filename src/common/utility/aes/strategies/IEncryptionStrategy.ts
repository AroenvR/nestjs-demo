import { GenerateSecretCallback } from '../EncryptionUtils';
import { IAesCipherData } from '../IAesCipherData';
import { TSupportedAesAlgorithms } from '../TSupportedAesAlgorithms';
import { EncryptionUtils } from '../EncryptionUtils'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * An interface for AES encryption strategies.
 *
 * @property algorithm - The AES Algorithm the strategy will use.
 * @property generateSecret - The callback required to create a random secret. It is provided by the {@link EncryptionUtils} object.
 */
export interface IAesEncryptionStrategy {
	algorithm: TSupportedAesAlgorithms;
	generateSecret: GenerateSecretCallback;

	/**
	 * Encrypts a plain text string.
	 * @param data - The plain text to encrypt.
	 * @returns The encryption result with all necessary metadata.
	 */
	encrypt(data: string): IAesCipherData;

	/**
	 * Decrypts the provided cipher data.
	 * @param data - The cipher data containing all required decryption information.
	 * @returns The decrypted plain text.
	 */
	decrypt(data: IAesCipherData): string;
}
