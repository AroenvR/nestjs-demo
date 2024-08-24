import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFooDto } from './dto/CreateFooDto';
import { UpdateFooDto } from './dto/UpdateFooDto';

@Injectable()
export class FooService {
    create(createFooDto: CreateFooDto) {
        throw new HttpException('Method not yet implemented', HttpStatus.BAD_REQUEST);
    }

    findAll() {
        throw new HttpException('Method not yet implemented', HttpStatus.BAD_REQUEST);
    }

    findOne(id: number) {
        throw new HttpException('Method not yet implemented', HttpStatus.BAD_REQUEST);
    }

    update(id: number, updateFooDto: UpdateFooDto) {
        throw new HttpException('Method not yet implemented', HttpStatus.BAD_REQUEST);
    }

    remove(id: number) {
        throw new HttpException('Method not yet implemented', HttpStatus.BAD_REQUEST);
    }
}
