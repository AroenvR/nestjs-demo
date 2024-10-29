import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateController } from './TemplateController';
import { TemplateService } from './TemplateService';
import { TemplateEntity } from './entity/TemplateEntity';
import { Module } from '@nestjs/common';
import { TemplateSubscriber } from './TemplateSubscriber';

/* Remember to add the module to the imports array in src/AppModule.ts */

@Module({
    imports: [TypeOrmModule.forFeature([TemplateEntity])],
    controllers: [TemplateController],
    providers: [TemplateService, TemplateSubscriber],
})
export class TemplateModule { }
