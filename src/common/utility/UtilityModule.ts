import { Global, Module } from "@nestjs/common";
import { EncryptionUtils } from "./aes/EncryptionUtils";
import { RequestBuilder } from "./request_builder/RequestBuilder";

@Global()
@Module({
	providers: [EncryptionUtils, RequestBuilder],
	exports: [EncryptionUtils, RequestBuilder],
})
export class UtilityModule {}
