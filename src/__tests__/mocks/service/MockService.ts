import { Observable, of } from 'rxjs';
import { CreateDto } from '../../../application/dtos/CreateDto';
import { UpdateDto } from '../../../application/dtos/UpdateDto';
import { ResponseDto } from '../../../application/dtos/ResponseDto';
import { AbstractEntity } from '../../../domain/entities/AbstractEntity';
import { ISseMessage } from '../../../application/events/ISseMessage';

/**
 * Mocks a service with CRUD operations based on the {@link IService} interface.
 */
export class MockService {
	events: Observable<ISseMessage<ResponseDto>> = of({} as ISseMessage<ResponseDto>); // Mocked Observable emitting ISseMessage<R>

	constructor(private createResponseDto: () => ResponseDto) {}

	create = jest.fn().mockImplementation((_: CreateDto) => {
		return Promise.resolve(this.createResponseDto()); // Mocks returning a created entity as ResponseDto
	});

	findAll = jest.fn().mockResolvedValue([this.createResponseDto()]); // Mocks finding multiple entities

	findOne = jest.fn().mockImplementation((criteria: Partial<ResponseDto>) => {
		if (criteria.id === 69) return null; // To test the error handling

		return this.createResponseDto();
	});

	update = jest.fn().mockImplementation((_: number, __: UpdateDto) => {
		return Promise.resolve(this.createResponseDto()); // Mocks updating an entity and returning it as ResponseDto
	});

	remove = jest.fn().mockResolvedValue(undefined); // Mocks removing an entity, returning void

	observe = jest.fn().mockReturnValue(this.events); // Mocks returning an observable of events

	emit = jest.fn().mockImplementation((_: AbstractEntity) => {
		// Simulates emitting an event with the given entity
	});
}
