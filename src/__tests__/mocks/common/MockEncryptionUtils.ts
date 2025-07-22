import { IAesCipherData } from "src/common/utility/aes/IAesCipherData";
import { EncryptionUtils } from "../../../common/utility/aes/EncryptionUtils";
import { mockWinstonAdapter } from "../mockLogAdapter";
import { TSupportedAesAlgorithms } from "src/common/utility/aes/TSupportedAesAlgorithms";

/**
 * Mock implementation of the {@link EncryptionUtils} class for testing purposes.
 */
export class MockEncryptionUtils extends EncryptionUtils {
	constructor() {
		super(mockWinstonAdapter);
	}

	public createRandomSecret = jest.fn((length: number) => Buffer.alloc(length));

	public aesEncrypt = jest.fn((_: string, algorithm: TSupportedAesAlgorithms) => ({
		algorithm,
		ciphertext: "mockCiphertext",
		iv: "mockIv",
		key: "mockKey",
		version: 1,
		cipher: "mockCipher",
	}));

	public aesDecrypt = jest.fn((_: IAesCipherData) => "mockPlaintext");

	public sha256 = jest.fn((_: string) => "c98c24b677eff44860afea6f493bbaec5bb1c4cbb209c6fc2bbb47f66ff2ad31");
}
