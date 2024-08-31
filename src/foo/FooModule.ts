import { Module } from '@nestjs/common';
import { FooService } from './FooService';
import { FooController } from './FooController';

@Module({
    controllers: [FooController],
    providers: [FooService],
})
export class FooModule { }
