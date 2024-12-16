import { Global, Module } from '@nestjs/common';
import { IServerConfig } from '../configuration/IServerConfig';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CorrelationManager } from './correlation/CorrelationManager';
import { NewWinstonAdapter } from './adapters/NewWinstonAdapter';

@Global()
@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: NewWinstonAdapter,
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

				switch (loggingConfig.driver) {
					case 'winston':
						return new NewWinstonAdapter(loggingConfig, correlationManager);
					default:
						throw new Error('Unsupported logging driver selected.');
				}
			},
			inject: [ConfigService],
		},
	],
	exports: [NewWinstonAdapter],
})
export class LoggerModule {}
