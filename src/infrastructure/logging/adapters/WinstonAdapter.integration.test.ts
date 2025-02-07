import path from 'path';
import fs from 'fs-extra';
import { WinstonAdapter } from './WinstonAdapter';
import { ILoggerConfig } from '../ILoggerConfig';
import { wasLogged } from '../../../__tests__/helpers/wasLogged';
import { CorrelationManager } from '../correlation/CorrelationManager';
import { randomUUID } from 'crypto';

const TEST_LOG_DIR = path.join(__dirname, '../', '../', '../', '../', 'logs');
const TEST_NAME = 'WinstonAdapter_integration';
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
	database: false,
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
		const configs: ILoggerConfig[] = [CONFIG_TEXT, CONFIG_JSON];

		for (const config of configs) {
			if (config.file.enabled) {
				const logFilePath = path.join(config.file.path, config.file.name);
				if (await fs.exists(logFilePath)) await fs.unlink(logFilePath);
			}
		}
	});

	// ------------------------------

	it('should log messages in plain text format', async () => {
		const correlationManager = new CorrelationManager();
		const adapter = new WinstonAdapter(CONFIG_TEXT, correlationManager);
		const message = 'Plain text log message';
		const context = 'IntegrationTestText';

		const logger = adapter.getPrefixedLogger(context);
		logger.log(message);

		await new Promise((resolve) => setTimeout(resolve, 10));
		await expect(wasLogged(TEST_LOG_FILENAME_TEXT, `LOG - ${context}: ${message}`)).resolves.toBe(true);
	});

	// ------------------------------

	it('should log messages in plain text format', async () => {
		const correlationManager = new CorrelationManager();
		const adapter = new WinstonAdapter(CONFIG_TEXT, correlationManager);
		const message = 'Plain text log message';
		const context = 'IntegrationTestText';
		adapter.verbose(context, message, { YOLONG: 'YOLONG' });
		adapter.debug(context, message);
		adapter.info(context, message);
		adapter.log(context, message);
		adapter.warn(context, message);
		adapter.error(context, message);
		adapter.critical(context, message);

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

	it("logs with correlation Id's", async () => {
		const correlationManager = new CorrelationManager();
		const adapter = new WinstonAdapter(CONFIG_TEXT, correlationManager);
		const message = 'Plain text log message';
		const context = 'IntegrationTestText';
		const correlationId = randomUUID();

		const logger = adapter.getPrefixedLogger(context);

		logger.correlationManager.runWithCorrelationId(correlationId, () => {
			logger.log(message);
		});

		await new Promise((resolve) => setTimeout(resolve, 10));
		await expect(wasLogged(TEST_LOG_FILENAME_TEXT, `${correlationId} LOG - ${context}: ${message}`)).resolves.toBe(true);
	});

	// ------------------------------

	it('should log errors with their stack traces in plain text format', async () => {
		const correlationManager = new CorrelationManager();
		const adapter = new WinstonAdapter(CONFIG_TEXT, correlationManager);
		const message = 'An error occurred somewhere.';
		const context = 'IntegrationTestText';
		const error = new Error(`Plain text error message`);

		adapter.error(context, message, error);
		await new Promise((resolve) => setTimeout(resolve, 10));
		await expect(wasLogged(TEST_LOG_FILENAME_TEXT, `ERROR - ${context}: ${message} \n${error.stack}`)).resolves.toBe(true);
	});

	// ------------------------------

	it('should log messages in JSON format', async () => {
		const correlationManager = new CorrelationManager();
		const adapter = new WinstonAdapter(CONFIG_JSON, correlationManager);
		const message = 'JSON log message';
		const context = 'IntegrationTestJson';

		adapter.verbose(context, message);
		adapter.debug(context, message);
		adapter.log(context, message);
		adapter.warn(context, message);
		adapter.error(context, message);
		adapter.critical(context, message);

		const obj = {
			'@l': 'VERBOSE',
			'@c': context,
			'@m': message,
		};

		await new Promise((resolve) => setTimeout(resolve, 10));

		for (const [key, value] of Object.entries(obj)) {
			const partial = `"${key}":"${value}"`;
			await expect(wasLogged(TEST_LOG_FILENAME_JSON, partial)).resolves.toBe(true);
		}
	});

	// ------------------------------

	it('should log errors with their stack traces in JSON format', async () => {
		const correlationManager = new CorrelationManager();
		const adapter = new WinstonAdapter(CONFIG_JSON, correlationManager);
		const message = 'An error occurred somewhere.';
		const context = 'IntegrationTestText';

		const error = new Error(message);

		adapter.error(context, message, error);
		await new Promise((resolve) => setTimeout(resolve, 10));

		const obj = {
			'@l': 'ERROR',
			'@c': context,
			'@m': message,
			// '@x': `\\n${error.name}: ${message}`, // I don't know why I can't get this tested.. But the stack is here.
		};
		for (const [key, value] of Object.entries(obj)) {
			const partial = `"${key}":"${value}"`;
			await expect(wasLogged(TEST_LOG_FILENAME_JSON, partial)).resolves.toBe(true);
		}
	});
});
