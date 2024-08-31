import { Module } from '@nestjs/common';
import { FooService } from './FooService';
import { FooController } from './FooController';
import { LoggerModule } from 'src/logging/LoggerModule';

@Module({
    controllers: [FooController],
    providers: [FooService],
})
export class FooModule { }
