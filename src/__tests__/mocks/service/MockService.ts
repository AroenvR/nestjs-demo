import { Observable, of } from 'rxjs';
import { IService } from '../../../application/services/IService';
import { CreateDto } from '../../../application/dtos/CreateDto';
import { UpdateDto } from '../../../application/dtos/UpdateDto';
import { ResponseDto } from '../../../application/dtos/ResponseDto';
import { ISseMessage } from '../../../abstract/ISseMessage';
import { AbstractEntity } from '../../../domain/entities/AbstractEntity';

/**
 * Mocks a service with CRUD operations based on the {@link IService} interface.
 */
export class MockService<C extends CreateDto, U extends UpdateDto, R extends ResponseDto> implements IService<C, U, R> {
	events: Observable<ISseMessage<R>> = of({} as ISseMessage<R>); // Mocked Observable emitting ISseMessage<R>

	constructor(private createResponseDto: () => R) {}

	create = jest.fn().mockImplementation((dto: C) => {
		return Promise.resolve(this.createResponseDto()); // Mocks returning a created entity as ResponseDto
	});

	findAll = jest.fn().mockResolvedValue([this.createResponseDto()]); // Mocks finding multiple entities

	findOne = jest.fn().mockImplementation((criteria: Partial<R>) => {
		if (criteria.id === 69) return null; // To test the error handling

		return this.createResponseDto();
	});

	update = jest.fn().mockImplementation((id: number, dto: U) => {
		return Promise.resolve(this.createResponseDto()); // Mocks updating an entity and returning it as ResponseDto
	});

	remove = jest.fn().mockResolvedValue(undefined); // Mocks removing an entity, returning void

	observe = jest.fn().mockReturnValue(this.events); // Mocks returning an observable of events

	emit = jest.fn().mockImplementation((entity: AbstractEntity) => {
		// Simulates emitting an event with the given entity
	});
}
