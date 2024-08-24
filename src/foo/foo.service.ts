import { HttpException, Injectable } from '@nestjs/common';
import { CreateFooDto } from './dto/create-foo.dto';
import { UpdateFooDto } from './dto/update-foo.dto';

@Injectable()
export class FooService {
	create(createFooDto: CreateFooDto) {
		throw new HttpException('Method not implemented', 400);
	}

	findAll() {
		throw new HttpException('Method not implemented', 400);
	}

	findOne(id: number) {
		throw new HttpException('Method not implemented', 400);
	}

	update(id: number, updateFooDto: UpdateFooDto) {
		throw new HttpException('Method not implemented', 400);
	}

	remove(id: number) {
		throw new HttpException('Method not implemented', 400);
	}
}
