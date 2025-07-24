import path from "path";
import fs from "fs-extra";
import { setTimeout as sleep } from "timers/promises";

/**
 * Check if a log message was logged in a log file.
 * @param logFile To check.
 * @param logMessage To check.
 * @returns If the log message was logged.
 */
export async function wasLogged(logFile: string, logMessage: string): Promise<boolean> {
	await new Promise((resolve) => setTimeout(resolve, 10));

	const logFilePath = path.join(__dirname, "..", "..", "..", "logs", `${logFile}.test.log`);

	// If for some reason the path doesn't exist, wait 100ms and try one more time.
	if (!(await fs.exists(logFilePath))) {
		await new Promise((resolve) => setTimeout(resolve, 100));
		if (!(await fs.exists(logFilePath))) return false;
	}

	const logContent = await fs.readFile(logFilePath, "utf-8");
	return logContent.includes(logMessage);
}

/**
 * Hybrid log check for **synchronous** tests — starts sync, falls back to async wait.
 * @param logFile To check.
 * @param logMessage To check.
 * @returns If the log message was logged.
 * @devnote Try not to use this check too often as it's a blocking action.
 */
export async function wasLoggedSync(logFile: string, logMessage: string): Promise<boolean> {
	const logFilePath = path.join(__dirname, "..", "..", "..", "logs", `${logFile}.test.log`);

	// Sync phase (quick checks)
	const start = Date.now();
	const timeout = 50;
	while (Date.now() - start < timeout) {
		if (fs.existsSync(logFilePath)) {
			const content = fs.readFileSync(logFilePath, "utf-8");
			if (content.includes(logMessage)) return true;
		}
		Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5); // sleep 5ms
	}

	// Async fallback: Give Winston time to flush
	for (let attempt = 0; attempt < 5; attempt++) {
		await sleep(10); // 10ms delay
		if (fs.existsSync(logFilePath)) {
			const content = await fs.promises.readFile(logFilePath, "utf-8");
			if (content.includes(logMessage)) return true;
		}
	}

	return false;
}
