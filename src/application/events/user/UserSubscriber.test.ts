import { DataSource, InsertEvent, UpdateEvent } from "typeorm";
import { UserSubscriber } from "./UserSubscriber";
import { UserService } from "../../services/user/UserService";
import { UserEntity } from "../../../domain/user/UserEntity";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";

describe("UserSubscriber", () => {
	let userSubscriber: UserSubscriber;
	let logAdapter: WinstonAdapter;
	let dataSource: DataSource;
	let userService: UserService;

	beforeEach(() => {
		// Mock dependencies
		logAdapter = {
			getPrefixedLogger: jest.fn().mockReturnValue({
				debug: jest.fn(),
			}),
		} as unknown as WinstonAdapter;

		dataSource = {
			subscribers: [],
		} as unknown as DataSource;

		userService = {
			emit: jest.fn(),
		} as unknown as UserService;

		// Instantiate UserSubscriber with mocked dependencies
		userSubscriber = new UserSubscriber(logAdapter, dataSource, userService);
	});

	it("should listen to UserEntity events", () => {
		expect(userSubscriber.listenTo()).toBe(UserEntity);
	});

	it("should log and emit on afterInsert", () => {
		// Prepare mock insert event
		const entity = MockUserEntity.get();
		const insertEvent = { entity } as InsertEvent<UserEntity>;

		// Invoke afterInsert
		userSubscriber.afterInsert(insertEvent);

		// Assert logging and service emit
		const logger = logAdapter.getPrefixedLogger(UserSubscriber.name);
		expect(logger.debug).toHaveBeenCalledWith(`Entity by uuid ${entity.uuid} was inserted`);
		expect(userService.emit).toHaveBeenCalledWith(entity);
	});

	it("should log and emit on afterUpdate", () => {
		// Prepare mock update event
		const entity = MockUserEntity.get();
		const updateEvent = { entity } as unknown as UpdateEvent<UserEntity>;

		// Invoke afterUpdate
		userSubscriber.afterUpdate(updateEvent);

		// Assert logging and service emit
		const logger = logAdapter.getPrefixedLogger(UserSubscriber.name);
		expect(logger.debug).toHaveBeenCalledWith(`Entity by uuid ${entity.uuid} was updated`);
		expect(userService.emit).toHaveBeenCalledWith(entity);
	});

	it("should add itself to dataSource subscribers upon instantiation", () => {
		expect(dataSource.subscribers).toContain(userSubscriber);
	});
});
