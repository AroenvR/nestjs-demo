import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "../../strategies/JwtStrategy";
import { OptionalJwtStrategy } from "../../../http_api/strategies/OptionalJwtStrategy";

if (!process.env.JASON_WEB_TOKEN_SECRET) throw new Error(`JWT secret is not defined`);

@Module({
	providers: [JwtStrategy, OptionalJwtStrategy],
	imports: [
		PassportModule,
		JwtModule.register({
			global: true,
			secret: process.env.JASON_WEB_TOKEN_SECRET,
		}),
	],
})
export class AuthModule {}
