import { NestFactory } from '@nestjs/core';
import { FooModule } from './foo/foo.module';

async function bootstrap() {
	const app = await NestFactory.create(FooModule);
	await app.listen(3000);
}
bootstrap();
