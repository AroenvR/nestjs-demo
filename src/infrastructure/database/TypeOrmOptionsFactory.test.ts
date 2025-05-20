import { TypeOrmOptionsFactory } from './TypeOrmOptionsFactory';
import { DatabaseDrivers, TDatabaseConfig } from './TDatabaseConfig';

describe('TypeOrmOptionsFactory', () => {
	let config: TDatabaseConfig;
	let factory: TypeOrmOptionsFactory;

	const ENCRYPTION_KEY = 'test-encryption-key';

	beforeEach(() => {
		factory = new TypeOrmOptionsFactory();

		// Mock environment variables for SQLCipher
		process.env.DATABASE_ENCRYPTION_KEY = ENCRYPTION_KEY;
	});

	afterEach(() => {
		delete process.env.DATABASE_ENCRYPTION_KEY;
	});

	// --------------------------------------------------

	it('should be defined', () => {
		expect(factory).toBeDefined();
	});

	// --------------------------------------------------

	it('should create SQLite options', () => {
		config = {
			driver: DatabaseDrivers.SQLITE,
			database: 'test.db',
			synchronize: true,
		};

		const options = factory.createTypeOrmModuleOptions(config, false);

		expect(options).toEqual({
			type: DatabaseDrivers.SQLITE,
			database: config.database,
			synchronize: config.synchronize,
			autoLoadEntities: true,
			logging: false,
		});
	});

	// --------------------------------------------------

	it('should create Better-SQLite3 options', () => {
		config = {
			driver: DatabaseDrivers.BETTER_SQLITE3,
			database: 'test.db',
			synchronize: false,
		};

		const options = factory.createTypeOrmModuleOptions(config, true);

		expect(options).toEqual({
			type: DatabaseDrivers.BETTER_SQLITE3,
			database: config.database,
			synchronize: config.synchronize,
			autoLoadEntities: true,
			logging: true,
		});
	});

	// --------------------------------------------------

	it('should create SQLCipher options', () => {
		config = {
			driver: DatabaseDrivers.SQLCIPHER,
			database: 'test.db',
			synchronize: true,
		};

		const options = factory.createTypeOrmModuleOptions(config, false);

		expect(options).toEqual({
			type: DatabaseDrivers.SQLITE, // SQLCipher uses SQLite under the hood
			database: config.database,
			key: ENCRYPTION_KEY,
			synchronize: config.synchronize,
			autoLoadEntities: true,
			logging: false,
		});
	});

	// --------------------------------------------------

	it('should create PostgreSQL options', () => {
		config = {
			driver: DatabaseDrivers.POSTGRES,
			database: 'testdb',
			host: 'localhost',
			port: 5432,
			username: 'postgres',
			password: 'password',
			synchronize: false,
		};

		const options = factory.createTypeOrmModuleOptions(config, true);

		expect(options).toEqual({
			type: DatabaseDrivers.POSTGRES,
			database: config.database,
			host: config.host,
			port: config.port,
			username: config.username,
			password: config.password,
			synchronize: config.synchronize,
			autoLoadEntities: true,
			logging: true,
		});
	});

	// --------------------------------------------------

	it('should throw error for missing encryption key with SQLCipher', () => {
		delete process.env.DATABASE_ENCRYPTION_KEY;

		config = {
			driver: DatabaseDrivers.SQLCIPHER,
			database: 'encrypted.db',
			synchronize: true,
		};

		expect(() => {
			factory.createTypeOrmModuleOptions(config, false);
		}).toThrow('SqlcipherOptionsStrategy: SQLCipher key is required for database encryption.');
	});

	// --------------------------------------------------

	it('should throw error for unsupported driver', () => {
		config = {
			// @ts-expect-error: Intentionally passing an invalid driver
			driver: 'UNSUPPORTED_DRIVER',
			database: 'test.db',
			synchronize: true,
		};

		expect(() => {
			factory.createTypeOrmModuleOptions(config, false);
		}).toThrow('TypeOrmOptionsFactory: No database strategy found for UNSUPPORTED_DRIVER');
	});
});
