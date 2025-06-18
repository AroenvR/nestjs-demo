import { Module } from "@nestjs/common";
import { AppStatusService } from "../../../application/services/app_status/AppStatusService";
import { AppStatusController } from "../../../http_api/controllers/app_status/AppStatusController";

@Module({
	controllers: [AppStatusController],
	providers: [AppStatusService],
})
export class AppStatusModule {}
