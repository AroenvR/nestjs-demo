import { TSupportedAesAlgorithms } from "./TSupportedAesAlgorithms";

/**
 * This interface represents the output of an AES encryption method
 * as well as the expected input for an AES decryption method.
 *
 * @property key - The encryption key used in the AES process.
 * @property algorithm - The AES algorithm variant used. This must be a member of the {@link SupportedAesAlgorithms} type.
 * @property iv - Optional. The initialization vector used during the encryption process. Required for certain AES modes.
 * @property authTag - Optional. The authentication tag generated during encryption, used in authenticated encryption modes (e.g., GCM).
 * @property version - The version number of the encryption scheme or the output format.
 * @property cipher - The resulting encrypted data (cipher text) from the encryption process.
 */
export interface IAesCipherData {
	key: string;
	algorithm: TSupportedAesAlgorithms;
	iv?: string;
	authTag?: string;
	version: number;
	cipher: string;
}
