import { IUtilities } from "../../../common/utility/IUtilities";
import { MockLogAdapter } from "./MockLogAdapter";
import { EncryptionUtils } from "../../../common/utility/aes/EncryptionUtils";
import { IRequestBuilder, RequestBuilder } from "../../../common/utility/request_builder/RequestBuilder";
import { CacheManagerAdapter } from "../../../common/utility/cache/CacheManagerAdapter";
import { MockEncryptionUtils } from "./MockEncryptionUtils";
import { ConfigService } from "@nestjs/config";
import { IServerConfig } from "../../../infrastructure/configuration/IServerConfig";
import { serverConfig } from "../../../infrastructure/configuration/serverConfig";
import { WinstonAdapter } from "../../../common/utility/logging/adapters/WinstonAdapter";
import { CronJobFactory } from "src/common/utility/Cron/CronJobFactory";

class MockServerConfigService extends ConfigService<any> {}

/**
 * MockUtilities provides a mocked implementation of the IUtilities interface for testing purposes.
 */
export class MockUtilities implements IUtilities {
	private readonly config: IServerConfig;
	public readonly configService: ConfigService<any>;
	public readonly logAdapter: WinstonAdapter;
	public readonly encryptionUtils: EncryptionUtils;
	public readonly requestBuilder: RequestBuilder;
	public readonly cache: CacheManagerAdapter;
	public readonly cronJobFactory: CronJobFactory;

	constructor(
		_serverConfig?: IServerConfig,
		_configService?: ConfigService<any>,
		_logAdapter?: WinstonAdapter,
		_encryptionUtils?: EncryptionUtils,
		_requestBuilder?: RequestBuilder,
		_cache?: CacheManagerAdapter,
		_cronFactory?: CronJobFactory,
	) {
		if (_serverConfig) this.config = _serverConfig;
		else this.config = serverConfig();

		if (_configService) this.configService = _configService;
		else this.configService = new MockServerConfigService(this.config);

		if (_logAdapter) this.logAdapter = _logAdapter;
		else this.logAdapter = new MockLogAdapter(this.config.logging) as unknown as WinstonAdapter; // TODO: Fix this typing...

		if (_encryptionUtils) this.encryptionUtils = _encryptionUtils;
		else this.encryptionUtils = new MockEncryptionUtils(this.logAdapter as WinstonAdapter);

		if (_requestBuilder) this.requestBuilder = _requestBuilder;
		else this.requestBuilder = {} as RequestBuilder; // TODO

		if (_cache) this.cache = _cache;
		else this.cache = {} as CacheManagerAdapter; // TODO

		if (_cronFactory) this.cronJobFactory = _cronFactory;
		else this.cronJobFactory = {} as CronJobFactory; // TODO
	}
}
