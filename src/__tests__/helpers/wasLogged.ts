import path from 'path';
import fs from 'fs-extra';

/**
 * Check if a log message was logged in a log file.
 * @param logFile To check.
 * @param logMessage To check.
 * @returns If the log message was logged.
 */
export async function wasLogged(logFile: string, logMessage: string): Promise<boolean> {
	const logFilePath = path.join(__dirname, '..', '..', '..', 'logs', `${logFile}.test.log`);
	if (!fs.existsSync(logFilePath)) return false;

	const logContent = fs.readFileSync(logFilePath, 'utf-8');
	return logContent.includes(logMessage);
}
