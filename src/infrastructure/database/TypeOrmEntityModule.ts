import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../../domain/user/UserEntity";
import { SessionEntity } from "../../domain/session/SessionEntity";

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity, SessionEntity])],
	exports: [TypeOrmModule],
})
export class TypeOrmEntityModule {}
