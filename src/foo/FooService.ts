import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFooDto } from './dto/CreateFooDto';
import { UpdateFooDto } from './dto/UpdateFooDto';
import { LogAdapter } from '../logging/LogAdapter';

@Injectable()
export class FooService {
	private readonly name = 'FooService';

	constructor(private readonly logger: LogAdapter) {}

	create(createFooDto: CreateFooDto) {
		this.logger.info(`${this.name}: Creating a new Foo entity.`);
		throw new HttpException('Method not yet implemented!', HttpStatus.BAD_REQUEST);
	}

	findAll() {
		this.logger.info(`${this.name}: Finding all Foo entities.`);
		throw new HttpException('Method not yet implemented!', HttpStatus.BAD_REQUEST);
	}

	findOne(id: number) {
		this.logger.info(`${this.name}: Finding a Foo entity with ID: ${id}`);
		throw new HttpException('Method not yet implemented!', HttpStatus.BAD_REQUEST);
	}

	update(id: number, updateFooDto: UpdateFooDto) {
		this.logger.info(`${this.name}: Updating Foo entity with ID: ${id}`);
		throw new HttpException('Method not yet implemented!', HttpStatus.BAD_REQUEST);
	}

	remove(id: number) {
		this.logger.info(`${this.name}: Deleting Foo entity with ID: ${id}`);
		throw new HttpException('Method not yet implemented!', HttpStatus.BAD_REQUEST);
	}
}
