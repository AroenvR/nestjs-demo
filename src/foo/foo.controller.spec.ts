import { Test, TestingModule } from '@nestjs/testing';
import { FooController } from './foo.controller';
import { FooService } from './foo.service';
import { CreateFooDto } from './dto/create-foo.dto';
import { UpdateFooDto } from './dto/update-foo.dto';

describe('FooController', () => {
    let controller: FooController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FooController],
            providers: [FooService],
        }).compile();

        controller = module.get<FooController>(FooController);
    });

    // --------------------------------------------------

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // --------------------------------------------------

    it('creates a Foo', () => {
        const dto = new CreateFooDto();
        expect(() => controller.create(dto)).toThrow('Method not yet implemented');
    });

    // --------------------------------------------------

    it('finds all Foos', () => {
        expect(() => controller.findAll()).toThrow('Method not yet implemented');
    });

    // --------------------------------------------------

    it('finds one Foo', () => {
        expect(() => controller.findOne('1')).toThrow('Method not yet implemented');
    });

    // --------------------------------------------------

    it('updates a Foo', () => {
        const dto = new UpdateFooDto();
        expect(() => controller.update('1', dto)).toThrow('Method not yet implemented');
    });

    // --------------------------------------------------

    it('deletes a Foo', () => {
        expect(() => controller.remove('1')).toThrow('Method not yet implemented');
    });
});
