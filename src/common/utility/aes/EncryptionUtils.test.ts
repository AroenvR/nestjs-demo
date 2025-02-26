import { createMockAppModule } from '../../../__tests__/mocks/module/createMockAppModule';
import { EncryptionUtils } from './EncryptionUtils';
import { UtilityModule } from '../UtilityModule';
import { wasLogged } from '../../../__tests__/helpers/wasLogged';
import { TSupportedAesAlgorithms } from './TSupportedAesAlgorithms';

describe('Encryption Utils', () => {
	const testName = 'EncryptionUtils';
	process.env.TEST_NAME = testName;

	const SECRET_LENGTH = 69;
	const DATA = 'Hello, secret!';

	let encryptionUtil: EncryptionUtils;

	beforeEach(async () => {
		const module = await createMockAppModule(UtilityModule);
		encryptionUtil = module.get<EncryptionUtils>(EncryptionUtils);
	});

	// --------------------------------------------------

	it('Should be defined', async () => {
		expect(encryptionUtil).toBeDefined();
		await expect(wasLogged(testName, `${testName}: Registered an encryption/decryption strategy for aes-256-gcm`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Can generate a random secret of a specified length', () => {
		const secret = encryptionUtil.createRandomSecret(SECRET_LENGTH);
		expect(secret).toHaveLength(SECRET_LENGTH);
	});

	// --------------------------------------------------

	it('Does not generate the same secret twice', async () => {
		const NUM_TO_GENERATE = 100 * 1000;

		const secretPromises: Promise<Buffer>[] = [];
		for (let i = 0; i < NUM_TO_GENERATE; i++) {
			const secretPromise = new Promise<Buffer>((resolve) => {
				const secret = encryptionUtil.createRandomSecret(SECRET_LENGTH);
				resolve(secret);
			});

			secretPromises.push(secretPromise);
		}

		const resolves = await Promise.allSettled(secretPromises);

		const secrets = resolves.map((r) => {
			if (r.status === 'fulfilled') return r.value;
		});
		expect(secrets.length).toEqual(NUM_TO_GENERATE);

		const uniqueSecrets = new Set(secrets);
		expect(uniqueSecrets.size).toEqual(NUM_TO_GENERATE);
	});

	// --------------------------------------------------

	describe('AES encryption/decryption', () => {
		it('Can encrypt string-based data using the AES-GCM algorithm', async () => {
			const algorithm: TSupportedAesAlgorithms = 'aes-256-gcm';
			const aesData = encryptionUtil.aesEncrypt(DATA, algorithm);

			expect(aesData.key).toHaveLength(44);
			expect(aesData.algorithm).toEqual(algorithm);
			expect(aesData.iv).toHaveLength(16);
			expect(aesData.authTag).toBeTruthy();
			expect(aesData.version).toEqual(1);
			expect(aesData.cipher).not.toEqual(DATA);

			await expect(wasLogged(testName, `${testName}: Encrypting data using ${algorithm}`)).resolves.toBe(true);
			await expect(wasLogged(testName, `${testName}: Successfully encrypted data using ${algorithm}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Can decrypt string-based data using the AES-GCM algorithm', async () => {
			const algorithm: TSupportedAesAlgorithms = 'aes-256-gcm';
			const aesData = encryptionUtil.aesEncrypt(DATA, algorithm);
			const decrypted = encryptionUtil.aesDecrypt(aesData);

			expect(decrypted).toEqual(DATA);

			await expect(wasLogged(testName, `${testName}: Decrypting data using ${algorithm}`)).resolves.toBe(true);
			await expect(wasLogged(testName, `${testName}: Successfully decrypted data using ${algorithm}`)).resolves.toBe(true);
		});
	});
});
