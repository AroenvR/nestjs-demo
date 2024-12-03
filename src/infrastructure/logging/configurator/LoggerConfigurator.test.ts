import path from 'path';
import { LoggerConfigurator } from './LoggerConfigurator';
import { serverConfig } from '../../../infrastructure/configuration/serverConfig';
import { ILoggerConfig } from '../ILoggerConfig';

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

const configPath = path.join(__dirname, '../', '../', '../', '../', 'config', 'testing', 'log_config.json');

describe('LoggerConfig', () => {
    test('Should return a fallback configuration when nothing is given', () => {
        const configurator = new LoggerConfigurator();
        const config = configurator.loadConfiguration();

        expect(config).toEqual(serverConfig().logging);
    });

    // ------------------------------

    test('Should return valid configuration when the right environment variable is set', () => {
        const configurator = new LoggerConfigurator();
        const config = configurator.loadConfiguration();

        expect(config).toEqual(serverConfig().logging);
    });

    // ------------------------------

    test('Should return a valid configuration when given a path to load from ', () => {
        const configurator = new LoggerConfigurator({ loader: 'file', path: configPath });
        const config = configurator.loadConfiguration();

        expect(config).toEqual(serverConfig().logging);
    });

    // ------------------------------

    test('Should return a valid configuration when given an object to load from ', () => {
        process.env.LOGSCRIBE_CONFIG = ''; // Unset the environment variable as it takes priority.

        const configurator = new LoggerConfigurator({ loader: 'object', config: defaultConfig });
        const config = configurator.loadConfiguration();

        expect(config).toEqual(defaultConfig);
    });

    // ------------------------------

    test('Environment variable configuration overrides a given configuration', () => {
        process.env.LOGSCRIBE_CONFIG = configPath;

        const configurator = new LoggerConfigurator({ loader: 'object', config: serverConfig().logging });
        const config = configurator.loadConfiguration();

        expect(config).toEqual(serverConfig().logging);
    });

    // ------------------------------

    test('Defaults to the fallback config if no correct loader is given', () => {
        // @ts-expect-error: Gotta ignore as the loader is typed.
        const configurator = new LoggerConfigurator({ loader: 'foobar' });
        const config = configurator.loadConfiguration();

        expect(config).toEqual(serverConfig().logging);
    });
});
