import { Module } from '@nestjs/common';
import { AuthService } from './AuthService';
import { AuthController } from './AuthController';

@Module({
	providers: [AuthService],
	controllers: [AuthController],
	imports: [],
})
export class AuthModule {}
