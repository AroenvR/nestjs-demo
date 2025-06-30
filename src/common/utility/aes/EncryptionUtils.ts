import crypto from "crypto";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { ILogger } from "../../../infrastructure/logging/ILogger";
import { IAesCipherData } from "./IAesCipherData";
import { TSupportedAesAlgorithms } from "./TSupportedAesAlgorithms";
import { IAesEncryptionStrategy } from "./strategies/IEncryptionStrategy";
import { AesGcmEncryptionStrategy } from "./strategies/AesGcmStrategy";

/**
 * A callback that all strategies must use to generate their random secrets.
 */
export type GenerateSecretCallback = (length: number) => Buffer;

/**
 * A utility object for encryption / decryption of data.
 * It can generate encryption secrets, encrypt data and decrypt data.
 * Supported AES algorithms are defined in the {@link TSupportedAesAlgorithms} type.
 */
@Injectable()
export class EncryptionUtils {
	protected logger: ILogger;
	private readonly aesStrategies: Map<TSupportedAesAlgorithms, IAesEncryptionStrategy> = new Map();

	constructor(logAdapter: WinstonAdapter) {
		this.logger = logAdapter.getPrefixedLogger(this.constructor.name);
		this.registerAesStrategies();
	}

	/**
	 * Create a random bytes secret in hexadecimal format.
	 * @param length Of the secret.
	 * @returns The random hexadecimal secret.
	 * @devnote This is the {@link GenerateSecretCallback} being used in strategies.
	 */
	public createRandomSecret(length: number) {
		return crypto.randomBytes(length);
	}

	/**
	 * Encrypt string-based data using an AES algorithm.
	 * @param data To encrypt.
	 * @param algorithm The AES algorithm use out of the {@link TSupportedAesAlgorithms} type.
	 * @returns All of the required data to decrypt the ciphertext adhering to the {@link IAesCipherData} interface.
	 */
	public aesEncrypt(data: string, algorithm: TSupportedAesAlgorithms): IAesCipherData {
		this.logger.debug(`Encrypting data using ${algorithm}`);

		const strategy = this.aesStrategies.get(algorithm);
		if (!strategy) throw new InternalServerErrorException(`No encryption strategy found for ${algorithm}`);

		const encrypted = strategy.encrypt(data);

		this.logger.debug(`Successfully encrypted data using ${algorithm}`);
		return encrypted;
	}

	/**
	 * Decrypt string-based data based on an {@link IAesCipherData} input object.
	 * @param data Containing all of the required decryption information.
	 * @returns the decrypted plain-text string.
	 */
	public aesDecrypt(data: IAesCipherData): string {
		this.logger.debug(`Decrypting data using ${data.algorithm}`);

		const strategy = this.aesStrategies.get(data.algorithm);
		if (!strategy) throw new InternalServerErrorException(`No decryption strategy found for ${data.algorithm}`);

		const decrypted = strategy.decrypt(data);

		this.logger.debug(`Successfully decrypted data using ${data.algorithm}`);
		return decrypted;
	}

	/**
	 * Hash data using SHA-256 and return the base64 encoded result.
	 * @param data To hash.
	 * @returns The base64 encoded SHA-256 hash of the data.
	 */
	public sha256(data: string): string {
		this.logger.debug(`Hashing data using SHA-256`);
		return crypto.createHash("sha256").update(data, "utf8").digest("base64");
	}

	/**
	 * Register a new encryption & decryption strategy to be able to use.
	 * @param algorithm To register.
	 * @param strategy To register.
	 */
	private registerAesStrategies() {
		const strategies: IAesEncryptionStrategy[] = [];

		strategies.push(new AesGcmEncryptionStrategy(this.createRandomSecret));
		// Add more strategies here. When you do, make sure to test the strategy.

		for (const strategy of strategies) {
			this.aesStrategies.set(strategy.algorithm, strategy);
			this.logger.info(`Registered an encryption/decryption strategy for ${strategy.algorithm}`);
		}
	}
}
