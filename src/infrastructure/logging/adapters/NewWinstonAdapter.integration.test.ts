import path from 'path';
import fs from 'fs-extra';
import { NewWinstonAdapter } from './NewWinstonAdapter';
import { ILoggerConfig } from '../ILoggerConfig';
import { wasLogged } from '../../../__tests__/helpers/wasLogged';

const TEST_LOG_DIR = path.join(__dirname, '../', '../', '../', '../', 'logs');
const TEST_NAME = 'NewWinstonAdapter_integration';
const TEST_LOG_FILENAME_TEXT = `${TEST_NAME}_text`;
const TEST_LOG_FILENAME_JSON = `${TEST_NAME}_json`;

const CONFIG_TEXT: ILoggerConfig = {
    appName: 'FileTest',
    driver: 'winston',
    enableCorrelation: true,
    level: 'verbose',
    console: false,
    file: {
        enabled: true,
        path: TEST_LOG_DIR,
        style: 'text',
        name: `${TEST_LOG_FILENAME_TEXT}.test.log`,
    },
    http: {
        enabled: false,
    },
    useWhitelist: false,
    prefixWhitelist: [],
};

const CONFIG_JSON: ILoggerConfig = {
    ...CONFIG_TEXT,
    file: {
        enabled: true,
        path: TEST_LOG_DIR,
        style: 'json',
        name: `${TEST_LOG_FILENAME_JSON}.test.log`,
    },
};

describe(TEST_NAME, () => {
    beforeAll(async () => {
        const configs: ILoggerConfig[] = [
            CONFIG_TEXT,
            CONFIG_JSON,
        ];

        for (const config of configs) {
            if (config.file.enabled) {
                const logFilePath = path.join(config.file.path, config.file.name);
                if (await fs.exists(logFilePath)) await fs.unlink(logFilePath);
            }
        }
    });

    // ------------------------------

    it('should log messages in plain text format', async () => {
        const adapter = new NewWinstonAdapter(CONFIG_TEXT);
        const message = 'Plain text log message';
        const context = 'IntegrationTestText';
        adapter.verbose(message, context);
        adapter.debug(message, context);
        adapter.info(message, context);
        adapter.log(message, context);
        adapter.warn(message, context);
        adapter.error(message, context);
        adapter.critical(message, context);

        await new Promise((resolve) => setTimeout(resolve, 10));
        await expect(wasLogged(TEST_LOG_FILENAME_TEXT, `VERBOSE - ${context}: ${message}`)).resolves.toBe(true);
        await expect(wasLogged(TEST_LOG_FILENAME_TEXT, `DEBUG - ${context}: ${message}`)).resolves.toBe(true);
        await expect(wasLogged(TEST_LOG_FILENAME_TEXT, `INFO - ${context}: ${message}`)).resolves.toBe(true);
        await expect(wasLogged(TEST_LOG_FILENAME_TEXT, `LOG - ${context}: ${message}`)).resolves.toBe(true);
        await expect(wasLogged(TEST_LOG_FILENAME_TEXT, `WARN - ${context}: ${message}`)).resolves.toBe(true);
        await expect(wasLogged(TEST_LOG_FILENAME_TEXT, `ERROR - ${context}: ${message}`)).resolves.toBe(true);
        await expect(wasLogged(TEST_LOG_FILENAME_TEXT, `VERBOSE - ${context}: ${message}`)).resolves.toBe(true);
    });

    // ------------------------------

    it("should log errors with their stack traces in plain text format", async () => {
        const adapter = new NewWinstonAdapter(CONFIG_TEXT);
        const message = 'An error occurred somewhere.';
        const context = 'IntegrationTestText';
        const error = new Error(`Plain text error message`);

        adapter.error(message, context, error);
        await new Promise((resolve) => setTimeout(resolve, 10));
        await expect(wasLogged(TEST_LOG_FILENAME_TEXT, `ERROR - ${context}: ${message} \n${error.stack}`)).resolves.toBe(true);
    });

    // ------------------------------

    it('should log messages in JSON format', async () => {
        const adapter = new NewWinstonAdapter(CONFIG_JSON);
        const message = 'JSON log message';
        const context = 'IntegrationTestJson';
        adapter.verbose(message, context);
        adapter.debug(message, context);
        adapter.log(message, context);
        adapter.warn(message, context);
        adapter.error(message, context);
        adapter.critical(message, context);

        await new Promise((resolve) => setTimeout(resolve, 10));
        await expect(wasLogged(TEST_LOG_FILENAME_JSON, message)).resolves.toBe(true);
    });
});
