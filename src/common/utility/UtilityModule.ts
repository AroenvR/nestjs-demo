import { Module } from '@nestjs/common';
import { EncryptionUtils } from './aes/EncryptionUtils';

@Module({
	providers: [EncryptionUtils],
})
export class UtilityModule {}
