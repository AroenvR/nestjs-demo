import { Global, Module } from '@nestjs/common';
import { LogAdapter } from './LogAdapter';
import { CorrelationManager, LoggerConfigurator, LoggerFactory } from 'ts-log-adapter';
import { defaultServerConfig } from '../IServerConfig';

@Global()
@Module({
	providers: [
		{
			provide: LogAdapter,
			useFactory: () => {
				const correlationManager = new CorrelationManager();

				// If no environment variable is set, use the default (fallback) configuration.
				const config = new LoggerConfigurator({ loader: 'object', config: defaultServerConfig.logging }).loadConfiguration();

				if (config.file.enabled) {
					// For log files which wish to be timestamped, the name should be set to 'TIMESTAMPED' and it will be overwritten accordingly.
					config.file.name = config.file.name === 'TIMESTAMPED' ? `${config.appName}.${Date.now().toString()}.log` : config.file.name;

					// For log files which wish to be named after the test, the name should be set to 'TEST_NAME.test.log' and it will be overwritten using the TEST_NAME environment variable.
					config.file.name = config.file.name === 'TEST_NAME.test.log' ? `${process.env.TEST_NAME}.test.log` : config.file.name;
				}

				const logger = new LoggerFactory().initialize(config, correlationManager);
				return new LogAdapter(logger);
			},
		},
	],
	exports: [LogAdapter],
})
export class LoggerModule {} // TODO: Document & Test
