import { Module } from "@nestjs/common";
import { EncryptionUtils } from "./aes/EncryptionUtils";
import { RequestBuilder } from "./request_builder/RequestBuilder";

@Module({
	providers: [EncryptionUtils, RequestBuilder],
})
export class UtilityModule {}
