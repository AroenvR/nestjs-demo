import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FooService } from './FooService';
import { CreateFooDto } from './dto/CreateFooDto';
import { UpdateFooDto } from './dto/UpdateFooDto';

@Controller('foo')
export class FooController {
	constructor(private readonly fooService: FooService) {}

	@Post()
	create(@Body() createFooDto: CreateFooDto) {
		return this.fooService.create(createFooDto);
	}

	@Get()
	findAll() {
		return this.fooService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.fooService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateFooDto: UpdateFooDto) {
		return this.fooService.update(+id, updateFooDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.fooService.remove(+id);
	}
}
