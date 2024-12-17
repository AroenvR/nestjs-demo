import { Test, TestingModule } from '@nestjs/testing';
import { LoggerMiddleware } from './LoggerMiddleware';
import { ConfigModule } from '@nestjs/config';
import { serverConfig } from '../../infrastructure/configuration/serverConfig';
import { LoggerModule } from '../../infrastructure/logging/LoggerModule';
import { wasLogged } from '../../__tests__/helpers/wasLogged';
import { randomUUID } from 'crypto';
import request from 'supertest';
import express, { Express } from 'express';

const TEST_NAME = 'LoggerMiddleware_Integration';

describe(TEST_NAME, () => {
	const ENDPOINT = '/test';
	let app: Express;

	beforeAll(async () => {
		process.env.TEST_NAME = TEST_NAME;

		const module: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					load: [serverConfig],
				}),
				LoggerModule,
			],
			providers: [LoggerMiddleware],
		}).compile();

		const middleware = module.get<LoggerMiddleware>(LoggerMiddleware);
		app = express();
		app.use(express.json());
		app.use(middleware.use.bind(middleware));

		app.get(ENDPOINT, (req, res) => {
			res.status(200).send('Success');
		});
	});

	// --------------------------------------------------

	it('logs requests and responses', async () => {
		await request(app).get(ENDPOINT);

		await expect(wasLogged(TEST_NAME, `LOG - LoggerMiddleware: Request: GET ${ENDPOINT}`)).resolves.toBe(true);

		await expect(wasLogged(TEST_NAME, `LOG - LoggerMiddleware: Response: GET ${ENDPOINT} - Status: 200`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('logs request and response cycles with a provided correlation Id', async () => {
		const correlationId = randomUUID();
		await request(app).get(ENDPOINT).set('x-correlation-id', correlationId);

		await expect(wasLogged(TEST_NAME, `${correlationId} LOG - LoggerMiddleware: Request: GET ${ENDPOINT}`)).resolves.toBe(true);

		await expect(wasLogged(TEST_NAME, `${correlationId} LOG - LoggerMiddleware: Response: GET ${ENDPOINT} - Status: 200`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('logs request headers, query, params, and body when truthy', async () => {
		const payload = {
			query: { test: 'queryValue' },
			params: { id: '123' },
			body: { key: 'value' },
		};

		app.get('/test/:id', (req, res) => {
			res.status(200).send('Success');
		});

		await request(app).get('/test/123').query(payload.query).set('Content-Type', 'application/json').set('host', '127.0.0.69').send(payload.body);

		await expect(
			wasLogged(
				TEST_NAME,
				`VERBOSE - LoggerMiddleware: Request Headers: {"host":"127.0.0.69","accept-encoding":"gzip, deflate","content-type":"application/json","content-length":"15","connection":"close"}`,
			),
		).resolves.toBe(true);

		await expect(wasLogged(TEST_NAME, `VERBOSE - LoggerMiddleware: Request Body: ${JSON.stringify(payload.body)}`)).resolves.toBe(true);

		await expect(wasLogged(TEST_NAME, `VERBOSE - LoggerMiddleware: Request Query: ${JSON.stringify(payload.query)}`)).resolves.toBe(true);
	});
});
