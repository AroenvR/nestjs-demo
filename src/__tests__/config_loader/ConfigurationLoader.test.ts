import { ConfigurationLoader, TLoadOpts } from '../../config_loader/ConfigurationLoader';
import fs from 'fs-extra';

jest.mock('fs-extra');

const testName = 'ConfigurationLoader';
describe(testName, () => {
	const mockFs = fs as jest.Mocked<typeof fs>;
	const testSchema = {
		type: 'object',
		properties: {
			key: { type: 'string' },
			value: { type: 'number' },
		},
		required: ['key', 'value'],
	};

	type TestConfig = {
		key: string;
		value: number;
	};

	let configLoader: ConfigurationLoader<TestConfig>;

	beforeEach(() => {
		jest.clearAllMocks();
		process.env = {};
	});

	describe('loadConfiguration', () => {
		it('should load configuration from environment variable path', () => {
			const configData = { key: 'test', value: 42 };
			process.env['CONFIG_PATH'] = '/path/to/config.json';
			mockFs.readFileSync.mockReturnValue(JSON.stringify(configData));

			configLoader = new ConfigurationLoader<TestConfig>(testSchema, 'CONFIG_PATH', null);

			const config = configLoader.loadConfiguration();

			expect(mockFs.readFileSync).toHaveBeenCalledWith('/path/to/config.json', 'utf8');
			expect(config).toEqual(configData);
		});

		// --------------------------------------------------

		it('should load configuration from file when loader is "file"', () => {
			const configData = { key: 'test', value: 42 };
			const opts: TLoadOpts<TestConfig> = {
				loader: 'file',
				path: '/path/to/config.json',
			};
			mockFs.readFileSync.mockReturnValue(JSON.stringify(configData));

			configLoader = new ConfigurationLoader<TestConfig>(testSchema, 'CONFIG_PATH', opts);

			const config = configLoader.loadConfiguration();

			expect(mockFs.readFileSync).toHaveBeenCalledWith('/path/to/config.json', 'utf8');
			expect(config).toEqual(configData);
		});

		// --------------------------------------------------

		it('should load configuration from object when loader is "object"', () => {
			const configData = { key: 'test', value: 42 };
			const opts: TLoadOpts<TestConfig> = {
				loader: 'object',
				config: configData,
			};

			configLoader = new ConfigurationLoader<TestConfig>(testSchema, 'CONFIG_PATH', opts);

			const config = configLoader.loadConfiguration();

			expect(mockFs.readFileSync).not.toHaveBeenCalled();
			expect(config).toEqual(configData);
		});

		// --------------------------------------------------

		it('should throw an error if configuration is invalid', () => {
			const invalidConfigData = { key: 'test' }; // Missing 'value'
			const opts: TLoadOpts<TestConfig> = {
				loader: 'object',
				config: invalidConfigData as any,
			};

			configLoader = new ConfigurationLoader<TestConfig>(testSchema, 'CONFIG_PATH', opts);

			expect(() => configLoader.loadConfiguration()).toThrow(`${testName}: Configuration did not pass JSON Schema validation:`);
		});

		// --------------------------------------------------

		it('should throw an error if no loader options are provided and no environment variable is set', () => {
			configLoader = new ConfigurationLoader<TestConfig>(testSchema, 'CONFIG_PATH', null);

			expect(() => configLoader.loadConfiguration()).toThrow(`${testName}: No configuration options were provided.`);
		});

		// --------------------------------------------------

		it('should throw an error if an invalid loader is specified', () => {
			const opts = { loader: 'invalid' } as any;

			configLoader = new ConfigurationLoader<TestConfig>(testSchema, 'CONFIG_PATH', opts);

			expect(() => configLoader.loadConfiguration()).toThrow(`${testName}: A loader must be specified.`);
		});
	});

	// --------------------------------------------------

	describe('validateConfig', () => {
		it('should validate a correct configuration', () => {
			const configData = { key: 'test', value: 42 };

			configLoader = new ConfigurationLoader<TestConfig>(testSchema, 'CONFIG_PATH', null);

			const result = configLoader.validateConfig(configData);

			expect(result).toBe(true);
		});

		// --------------------------------------------------

		it('should throw an error for invalid configuration', () => {
			const invalidConfigData = { key: 'test' }; // Missing 'value'

			configLoader = new ConfigurationLoader<TestConfig>(testSchema, 'CONFIG_PATH', null);

			expect(() => configLoader.validateConfig(invalidConfigData as any)).toThrow(
				`${testName}: Configuration did not pass JSON Schema validation:`,
			);
		});
	});

	// --------------------------------------------------

	describe('config getter', () => {
		it('should return the loaded configuration', () => {
			const configData = { key: 'test', value: 42 };
			const opts: TLoadOpts<TestConfig> = {
				loader: 'object',
				config: configData,
			};

			configLoader = new ConfigurationLoader<TestConfig>(testSchema, 'CONFIG_PATH', opts);
			configLoader.loadConfiguration();

			expect(configLoader.config).toEqual(configData);
		});

		// --------------------------------------------------

		it('should throw an error if configuration is not loaded', () => {
			configLoader = new ConfigurationLoader<TestConfig>(testSchema, 'CONFIG_PATH', null);

			expect(() => configLoader.config).toThrow(`${testName}: Configuration has not been loaded.`);
		});
	});
});
