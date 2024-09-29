// wasLogged.spec.ts

import { wasLogged } from './wasLogged';
import path from 'path';
import fs from 'fs-extra';

describe('wasLogged', () => {
	const logsDir = path.join(__dirname, '..', '..', '..', 'logs');
	const logFileName = 'test-log.test.log';
	const logFilePath = path.join(logsDir, logFileName);

	beforeAll(() => {
		// Ensure the logs directory exists
		fs.ensureDirSync(logsDir);
	});

	afterEach(() => {
		// Clean up log file after each test
		if (fs.existsSync(logFilePath)) {
			fs.unlinkSync(logFilePath);
		}
	});

	// --------------------------------------------------

	it('should return true if the log message is found in the log file', async () => {
		const logMessage = 'This is a test log message';

		// Write the log message to the log file
		fs.writeFileSync(logFilePath, logMessage, 'utf-8');

		const result = await wasLogged('test-log', logMessage);
		expect(result).toBe(true);
	});

	// --------------------------------------------------

	it('should return false if the log message is not found in the log file', async () => {
		const logMessage = 'This is a test log message';
		const otherMessage = 'This is another log message';

		// Write a different message to the log file
		await fs.writeFile(logFilePath, otherMessage, 'utf-8');

		const result = await wasLogged('test-log', logMessage);
		expect(result).toBe(false);
	});

	// --------------------------------------------------

	it('should return false if the log file does not exist', async () => {
		// Ensure the log file does not exist
		if (fs.existsSync(logFilePath)) {
			fs.unlinkSync(logFilePath);
		}

		const logMessage = 'This is a test log message';
		const result = await wasLogged('test-log', logMessage);
		expect(result).toBe(false);
	});
});
