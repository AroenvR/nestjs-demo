import crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { IAesEncryptionStrategy } from './IEncryptionStrategy';
import { IAesCipherData } from '../IAesCipherData';
import { TSupportedAesAlgorithms } from '../TSupportedAesAlgorithms';
import { GenerateSecretCallback } from '../EncryptionUtils';

/**
 * AES-256-GCM encryption strategy.
 *
 * @implements IAesEncryptionStrategy
 */
@Injectable()
export class AesGcmEncryptionStrategy implements IAesEncryptionStrategy {
	public readonly algorithm: TSupportedAesAlgorithms = 'aes-256-gcm';
	public readonly generateSecret: GenerateSecretCallback;

	constructor(secret: GenerateSecretCallback) {
		this.generateSecret = secret;
	}

	/**
	 * Encrypts a plain text string using AES-256-GCM.
	 * @param data - The plain text to encrypt.
	 * @returns The cipher data containing the encrypted text and metadata.
	 */
	public encrypt(data: string): IAesCipherData {
		const key = this.generateSecret(32);
		const iv = this.generateSecret(12);

		const cipherInstance = crypto.createCipheriv(this.algorithm, key, iv);
		const encrypted = Buffer.concat([cipherInstance.update(data, 'utf8'), cipherInstance.final()]);
		const authTag = cipherInstance.getAuthTag();

		const cipherData: IAesCipherData = {
			key: key.toString('base64'),
			algorithm: this.algorithm,
			iv: iv.toString('base64'),
			authTag: authTag.toString('base64'),
			version: 1,
			cipher: encrypted.toString('base64'),
		};

		return cipherData;
	}

	/**
	 * Decrypts cipher data using AES-256-GCM.
	 * @param data - The cipher data containing all required decryption information.
	 * @returns The decrypted plain text.
	 */
	public decrypt(data: IAesCipherData): string {
		const key = Buffer.from(data.key, 'base64');
		const iv = Buffer.from(data.iv, 'base64');
		const authTag = Buffer.from(data.authTag, 'base64');
		const encryptedData = Buffer.from(data.cipher, 'base64');

		const decipher = crypto.createDecipheriv(data.algorithm, key, iv);
		decipher.setAuthTag(authTag);

		const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

		return decrypted.toString('utf8');
	}
}
