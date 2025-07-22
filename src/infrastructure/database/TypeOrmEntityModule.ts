import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../../domain/user/UserEntity";
import { RefreshTokenEntity } from "../../domain/refresh_token/RefreshTokenEntity";

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity])],
	exports: [TypeOrmModule],
})
export class TypeOrmEntityModule {}
