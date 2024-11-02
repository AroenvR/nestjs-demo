import { Global, Module } from '@nestjs/common';
import { LogAdapter } from './LogAdapter';
import { CorrelationManager, LoggerFactory } from 'ts-log-adapter';
import { IServerConfig } from '../configuration/IServerConfig';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: LogAdapter,
			useFactory: (configService: ConfigService<IServerConfig>) => {
				const correlationManager = new CorrelationManager();

				// Retrieve logging configuration using ConfigService
				const loggingConfig = configService.get<IServerConfig['logging']>('logging');

				// If loggingConfig is undefined, you can handle it or throw an error
				if (!loggingConfig) {
					throw new Error('Logging configuration is missing.');
				}

				// Process the logging configuration
				if (loggingConfig.file.enabled) {
					// Handle 'TIMESTAMPED' and 'TEST_NAME.test.log' cases
					loggingConfig.file.name =
						loggingConfig.file.name === 'TIMESTAMPED' ? `${loggingConfig.appName}.${Date.now().toString()}.log` : loggingConfig.file.name;

					loggingConfig.file.name =
						loggingConfig.file.name === 'TEST_NAME.test.log' ? `${process.env.TEST_NAME}.test.log` : loggingConfig.file.name;
				}

				// Initialize the logger with the retrieved configuration
				const logger = new LoggerFactory().initialize(loggingConfig, correlationManager);
				return new LogAdapter(logger);
			},
			inject: [ConfigService],
		},
	],
	exports: [LogAdapter],
})
export class LoggerModule {}
