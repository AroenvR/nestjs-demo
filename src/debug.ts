import dotenv from "dotenv";
dotenv.config();
import { repl } from "@nestjs/core";
import { AppModule } from "./infrastructure/AppModule";

async function bootstrap() {
	await repl(AppModule);
}

bootstrap();
