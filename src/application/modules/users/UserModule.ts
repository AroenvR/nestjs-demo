import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../../domain/entities/user/UserEntity';
import { UserController } from '../../controllers/users/UserController';
import { UserService } from '../../services/user/UserService';
import { UserSubscriber } from '../../events/UserSubscriber';

/* Remember to add the module to the imports array in src/AppModule.ts */

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity])],
	controllers: [UserController],
	providers: [UserService, UserSubscriber],
})
export class UserModule {}
