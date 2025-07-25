import { ConfigService } from "@nestjs/config";
import { IPrefixedLogger } from "./logging/ILogger";
import { EncryptionUtils } from "./aes/EncryptionUtils";
import { CacheManagerAdapter } from "./cache/CacheManagerAdapter";
import { IRequestBuilder } from "./request_builder/RequestBuilder";
import { CronJobFactory } from "./Cron/CronJobFactory";

/**
 * A collection of utility services used across the application.
 * @property logAdapter - Provides logging capabilities using the WinstonAdapter.
 * @property encryptionUtils - Provides encryption, decryption, and other cryptography utilities.
 * @property requestBuilder - Facilitates building and executing HTTP requests.
 * @property cache - Manages caching operations.
 */
export interface IUtilities {
	logAdapter: IPrefixedLogger;
	encryptionUtils: EncryptionUtils; // TODO: Interface this
	requestBuilder: IRequestBuilder;
	cache: CacheManagerAdapter; // TODO: Interface this
	configService: ConfigService;
	cronJobFactory: CronJobFactory;
}
