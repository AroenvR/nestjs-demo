import path from 'path';
import { LoggerConfigurator } from './LoggerConfigurator';
import { serverConfig } from 'src/infrastructure/configuration/serverConfig';
import { ILoggerConfig } from '../ILopggerConfig';

const defaultConfig: ILoggerConfig = {
	appName: 'DefaultConfigTest',
	driver: 'winston',
	enableCorrelation: false,
	level: 'verbose',
	console: true,
	file: {
		enabled: false,
	},
	http: {
		enabled: false,
	},
	useWhitelist: false,
	prefixWhitelist: [],
};

describe('LoggerConfig', () => {
	test('Should return a fallback configuration when nothing is given', () => {
		const configurator = new LoggerConfigurator();
		const config = configurator.loadConfiguration();

		expect(config).toEqual(serverConfig().logging);
	});

	// ------------------------------

	test('Should return valid configuration when the right environment variable is set', () => {
		process.env.LOGSCRIBE_CONFIG = path.join(__dirname, '../', 'config_files', 'loggerConfig.json');
		const configurator = new LoggerConfigurator();
		const config = configurator.loadConfiguration();

		expect(config).toEqual(defaultConfig);
	});

	// ------------------------------

	test('Should return a valid configuration when given a path to load from ', () => {
		const configPath = path.join(__dirname, '../', 'config_files', 'loggerConfig.json');
		const configurator = new LoggerConfigurator({ loader: 'file', path: configPath });
		const config = configurator.loadConfiguration();

		expect(config).toEqual(defaultConfig);
	});

	// ------------------------------

	test('Should return a valid configuration when given an object to load from ', () => {
		const configurator = new LoggerConfigurator({ loader: 'object', config: defaultConfig });
		const config = configurator.loadConfiguration();

		expect(config).toEqual(defaultConfig);
	});

	// ------------------------------

	test('Environment variable configuration overrides a given configuration', () => {
		process.env.LOGSCRIBE_CONFIG = path.join(__dirname, '../', 'config_files', 'loggerConfig.json');

		const configurator = new LoggerConfigurator({ loader: 'object', config: serverConfig().logging });
		const config = configurator.loadConfiguration();

		expect(config).toEqual(defaultConfig);
	});

	// ------------------------------

	test('Defaults to the fallback config if no correct loader is given', () => {
		// @ts-expect-error: Gotta ignore as the loader is typed.
		const configurator = new LoggerConfigurator({ loader: 'foobar' });
		const config = configurator.loadConfiguration();

		expect(config).toEqual(serverConfig().logging);
	});

	// ------------------------------

	test('Throws if the JSON schema fails to validate the given configuration', () => {
		const invalidConfig = {
			some: 'invalid',
			config: 'here',
		};
		// @ts-expect-error: Gotta ignore as the config is typed.
		const configurator = new LoggerConfigurator({ loader: 'object', config: invalidConfig });
		expect(() => configurator.loadConfiguration()).toThrowError();
	});
});
