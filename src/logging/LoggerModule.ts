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
					config.file.name = config.file.name === 'TIMESTAMPED' ? `${config.appName}.${Date.now().toString()}.log` : 'TIMESTAMPED';
				}

				const logger = new LoggerFactory().initialize(config, correlationManager);
				return new LogAdapter(logger);
			},
		},
	],
	exports: [LogAdapter],
})
export class LoggerModule {} // TODO: Document & Test
