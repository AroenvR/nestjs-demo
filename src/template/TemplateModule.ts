import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateController } from './TemplateController';
import { TemplateService } from './TemplateService';
import { TemplateEntity } from './entities/TemplateEntity';
import { Module } from '@nestjs/common';

/*
    Remember to add the module to the imports array in src/AppModule.ts
*/

@Module({
	imports: [TypeOrmModule.forFeature([TemplateEntity])],
	controllers: [TemplateController],
	providers: [TemplateService],
})
export class TemplateModule {}
