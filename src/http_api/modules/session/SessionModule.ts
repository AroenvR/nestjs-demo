import { Module } from '@nestjs/common';
import { TypeOrmEntityModule } from '../../../infrastructure/database/TypeOrmEntityModule';

/* Remember to add the module to the imports array in src/AppModule.ts */

@Module({
	imports: [TypeOrmEntityModule],
	controllers: [],
	providers: [],
})
export class SessionModule {}
