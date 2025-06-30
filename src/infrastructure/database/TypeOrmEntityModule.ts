import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../../domain/user/UserEntity";
import { SessionEntity } from "../../domain/session/SessionEntity";
import { RefreshTokenEntity } from "../../domain/refresh_token/RefreshTokenEntity";

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity, SessionEntity, RefreshTokenEntity])],
	exports: [TypeOrmModule],
})
export class TypeOrmEntityModule {}
