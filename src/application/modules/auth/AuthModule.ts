import { Module } from '@nestjs/common';
import { AuthService } from '../../services/auth/AuthService';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../../http_api/strategies/JwtStrategy';
import { AuthController } from '../../../http_api/controllers/auth/AuthController';

if (!process.env.JASON_WEB_TOKEN_SECRET) throw new Error(`JWT secret is not defined`);
if (!process.env.JASON_WEB_TOKEN_EXPIRY) throw new Error(`JWT expiry is not defined`);

@Module({
	providers: [AuthService, JwtStrategy],
	controllers: [AuthController],
	imports: [
		PassportModule,
		JwtModule.register({
			// TOOD: Use NestJS config module
			global: true,
			secret: process.env.JASON_WEB_TOKEN_SECRET,
			signOptions: { expiresIn: process.env.JASON_WEB_TOKEN_EXPIRY },
		}),
	],
})
export class AuthModule {}
