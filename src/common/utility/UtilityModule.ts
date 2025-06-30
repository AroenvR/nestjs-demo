import { Global, Module } from "@nestjs/common";
import { EncryptionUtils } from "./aes/EncryptionUtils";
import { RequestBuilder } from "./request_builder/RequestBuilder";
import { CacheManagerAdapter } from "./cache/CacheManagerAdapter";

@Global()
@Module({
	providers: [EncryptionUtils, RequestBuilder, CacheManagerAdapter],
	exports: [EncryptionUtils, RequestBuilder, CacheManagerAdapter],
})
export class UtilityModule {}
