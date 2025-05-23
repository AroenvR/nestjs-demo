import { Module } from "@nestjs/common";
import { TypeOrmEntityModule } from "../../../infrastructure/database/TypeOrmEntityModule";
import { SessionService } from "../../../application/services/session/SessionService";
import { SessionController } from "../../../http_api/controllers/session/SessionController";

/* Remember to this the module to the imports array in src/AppModule.ts */

@Module({
	imports: [TypeOrmEntityModule],
	controllers: [SessionController],
	providers: [SessionService],
})
export class SessionModule {}
