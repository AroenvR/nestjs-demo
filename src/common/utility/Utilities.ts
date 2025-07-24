import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EncryptionUtils } from "./aes/EncryptionUtils";
import { RequestBuilder } from "./request_builder/RequestBuilder";
import { CacheManagerAdapter } from "./cache/CacheManagerAdapter";
import { WinstonAdapter } from "./logging/adapters/WinstonAdapter";
import { IUtilities } from "./IUtilities";

/**
 * UtilityService provides a collection of utility services used across the application.
 */
@Injectable()
export class Utilities implements IUtilities {
	constructor(
		public readonly logAdapter: WinstonAdapter,
		public readonly encryptionUtils: EncryptionUtils,
		public readonly requestBuilder: RequestBuilder,
		public readonly cache: CacheManagerAdapter,
		public readonly configService: ConfigService,
	) {}
}
