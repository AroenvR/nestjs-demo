import { Module } from '@nestjs/common';
import { UserController } from '../../controllers/user/UserController';
import { UserService } from '../../../application/services/user/UserService';
import { UserSubscriber } from '../../../application/events/user/UserSubscriber';
import { TypeOrmEntityModule } from '../../../infrastructure/database/TypeOrmEntityModule';

/* Remember to add the module to the imports array in src/AppModule.ts */

@Module({
	imports: [TypeOrmEntityModule],
	controllers: [UserController],
	providers: [UserService, UserSubscriber],
})
export class UserModule {}
