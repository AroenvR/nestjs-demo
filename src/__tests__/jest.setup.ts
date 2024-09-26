import path from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';

const testEnvPath = path.join(__dirname, '..', '..', '.env.test');
const envFileExists = fs.existsSync(testEnvPath);

if (!envFileExists) throw new Error(`Test environment file not found: ${testEnvPath}`);
else dotenv.config({ path: '.env.test' });

afterEach(async () => {
	const testLogPath = path.join(__dirname, '..', '..', 'logs', `${process.env.TEST_NAME}.test.log`);
	if (await fs.exists(testLogPath)) await fs.unlink(testLogPath);
});

afterAll(() => {
	jest.clearAllTimers();
	jest.restoreAllMocks();
});
