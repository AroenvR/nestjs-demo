import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../domain/user/UserEntity';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity])],
	exports: [TypeOrmModule],
})
export class TypeOrmEntityModule {}
