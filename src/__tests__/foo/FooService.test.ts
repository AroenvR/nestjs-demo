import { Test, TestingModule } from '@nestjs/testing';
import { FooService } from '../../foo/FooService';
import { CreateFooDto } from '../../foo/dto/CreateFooDto';
import { UpdateFooDto } from '../../foo/dto/UpdateFooDto';

describe('FooService', () => {
	let service: FooService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [FooService],
		}).compile();

		service = module.get<FooService>(FooService);
	});

	// --------------------------------------------------

	it('should be defined', () => {
		expect(() => service).toBeDefined();
	});

	// --------------------------------------------------

	it('creates a Foo', () => {
		const dto = new CreateFooDto();
		expect(() => service.create(dto)).toThrow('Method not yet implemented');
	});

	// --------------------------------------------------

	it('finds all Foos', () => {
		expect(() => service.findAll()).toThrow('Method not yet implemented');
	});

	// --------------------------------------------------

	it('finds one Foo', () => {
		expect(() => service.findOne(1)).toThrow('Method not yet implemented');
	});

	// --------------------------------------------------

	it('updates a Foo', () => {
		const dto = new UpdateFooDto();
		expect(() => service.update(1, dto)).toThrow('Method not yet implemented');
	});

	// --------------------------------------------------

	it('removes a Foo', () => {
		expect(() => service.remove(1)).toThrow('Method not yet implemented');
	});
});
