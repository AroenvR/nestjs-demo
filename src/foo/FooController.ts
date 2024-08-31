import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FooService } from './FooService';
import { CreateFooDto } from './dto/CreateFooDto';
import { UpdateFooDto } from './dto/UpdateFooDto';
import { LogAdapter } from 'src/logging/LogAdapter';

@Controller('foo')
export class FooController {
    private readonly name = 'FooController';

    constructor(
        // private readonly logger: LogAdapter,
        private readonly fooService: FooService
    ) { }

    @Post()
    create(@Body() createFooDto: CreateFooDto) {
        // this.logger.info(`${this.name}: Creating a new Foo entity.`);
        return this.fooService.create(createFooDto);
    }

    @Get()
    findAll() {
        // this.logger.info(`${this.name}: Finding all Foo entities.`);
        return this.fooService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        // this.logger.info(`${this.name}: Finding a Foo entity with ID: ${id}`);
        return this.fooService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFooDto: UpdateFooDto) {
        // this.logger.info(`${this.name}: Updating Foo entity with ID: ${id}`);
        return this.fooService.update(+id, updateFooDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        // this.logger.info(`${this.name}: Deleting Foo entity with ID: ${id}`);
        return this.fooService.remove(+id);
    }
}
