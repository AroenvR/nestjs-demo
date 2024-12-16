import { DataSource, InsertEvent, UpdateEvent } from 'typeorm';
import { UserSubscriber } from './UserSubscriber';
import { UserService } from '../../../application/services/user/UserService';
import { UserEntity } from '../../../domain/entities/user/UserEntity';
import { NewWinstonAdapter } from '../../../infrastructure/logging/adapters/NewWinstonAdapter';

describe('UserSubscriber', () => {
	let userSubscriber: UserSubscriber;
	let logAdapter: NewWinstonAdapter;
	let dataSource: DataSource;
	let userService: UserService;

	beforeEach(() => {
		// Mock dependencies
		logAdapter = {
			getPrefixedLogger: jest.fn().mockReturnValue({
				info: jest.fn(),
			}),
		} as unknown as NewWinstonAdapter;

		dataSource = {
			subscribers: [],
		} as unknown as DataSource;

		userService = {
			emit: jest.fn(),
		} as unknown as UserService;

		// Instantiate UserSubscriber with mocked dependencies
		userSubscriber = new UserSubscriber(logAdapter, dataSource, userService);
	});

	it('should listen to UserEntity events', () => {
		expect(userSubscriber.listenTo()).toBe(UserEntity);
	});

	it('should log and emit on afterInsert', () => {
		// Prepare mock insert event
		const entity = { id: 1 } as UserEntity;
		const insertEvent = { entity } as InsertEvent<UserEntity>;

		// Invoke afterInsert
		userSubscriber.afterInsert(insertEvent);

		// Assert logging and service emit
		const logger = logAdapter.getPrefixedLogger(UserSubscriber.name);
		expect(logger.info).toHaveBeenCalledWith('Entity by id 1 was inserted');
		expect(userService.emit).toHaveBeenCalledWith(entity);
	});

	it('should log and emit on afterUpdate', () => {
		// Prepare mock update event
		const entity = { id: 2 } as UserEntity;
		const updateEvent = { entity } as unknown as UpdateEvent<UserEntity>;

		// Invoke afterUpdate
		userSubscriber.afterUpdate(updateEvent);

		// Assert logging and service emit
		const logger = logAdapter.getPrefixedLogger(UserSubscriber.name);
		expect(logger.info).toHaveBeenCalledWith('Entity by id 2 was updated');
		expect(userService.emit).toHaveBeenCalledWith(entity);
	});

	it('should add itself to dataSource subscribers upon instantiation', () => {
		expect(dataSource.subscribers).toContain(userSubscriber);
	});
});
