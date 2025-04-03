import { validate } from 'class-validator';
import { SessionEntity } from '../../../domain/session/SessionEntity';
import { UpdateSessionDto } from './UpdateSessionDto';
import { SessionResponseDto } from './SessionResponseDto';
import { MockCreateSessionDto, MockUpdateSessionDto } from '../../../__tests__/mocks/dto/MockSessionDto';
import { MockSessionEntity } from '../../../__tests__/mocks/entity/MockSessionEntity';
import { CreateSessionDto } from './CreateSessionDto';
import { sessionConstants } from '../../../common/constants/sessionConstants';
import { falsyValues } from '../../../__tests__/helpers/falsyValues';

describe.skip("Session DTO's", () => {
	let createDto: CreateSessionDto;
	let updateDto: UpdateSessionDto;

	beforeEach(() => {
		createDto = MockCreateSessionDto.get();
		updateDto = MockUpdateSessionDto.get();
	});

	// describe('Create DTO', () => {
	//     it('Can be used to create the entity', async () => {
	//         const errors = await validate(createDto);
	//         expect(errors.length).toEqual(0);

	//         const entity = SessionEntity.create(createDto);
	//         expect(entity.Sessionname).toEqual(createDto.Sessionname);
	//         expect(entity.password).toEqual(createDto.password);
	//     });

	//     // --------------------------------------------------

	//     it('Sessionname must be a string adhering to min/max lengths', async () => {
	//         for (const value of falsyValues(SessionConstants.minSessionnameLength, SessionConstants.maxSessionnameLength)) {
	//             // @ts-expect-error: expects a string.
	//             createDto.Sessionname = value;

	//             const errors = await validate(createDto);
	//             expect(errors.length).toBeGreaterThanOrEqual(1);
	//         }
	//     });

	//     // --------------------------------------------------

	//     it('Password must be a string adhering to min length', async () => {
	//         for (const value of falsyValues(SessionConstants.minPasswordLength)) {
	//             // @ts-expect-error: expects a string.
	//             createDto.password = value;

	//             const errors = await validate(createDto);
	//             expect(errors.length).toBeGreaterThanOrEqual(1);
	//         }
	//     });
	// });

	// // --------------------------------------------------

	// describe('Update DTO', () => {
	//     it('Can be used to update the entity', async () => {
	//         const errors = await validate(updateDto);
	//         expect(errors.length).toEqual(0);

	//         const entity = MockSessionEntity.get();
	//         entity.update(updateDto);

	//         expect(entity.Sessionname).toEqual(updateDto.Sessionname);
	//         expect(entity.password).toEqual(updateDto.password);
	//     });

	//     // --------------------------------------------------

	//     it('Sessionname must be a string adhering to min/max length', async () => {
	//         for (const value of falsyValues(SessionConstants.minSessionnameLength, SessionConstants.maxSessionnameLength, true)) {
	//             // @ts-expect-error: Sessionname expects a string.
	//             updateDto.Sessionname = value;

	//             const errors = await validate(updateDto);
	//             expect(errors.length).toBeGreaterThanOrEqual(1);
	//         }
	//     });

	//     // --------------------------------------------------

	//     it('Password must be a string adhering to min length', async () => {
	//         for (const value of falsyValues(SessionConstants.minPasswordLength, null, true)) {
	//             // @ts-expect-error: Sessionname expects a string.
	//             updateDto.password = value;

	//             const errors = await validate(updateDto);
	//             expect(errors.length).toBeGreaterThanOrEqual(1);
	//         }
	//     });
	// });

	// // --------------------------------------------------

	// describe('Response DTO', () => {
	//     it('Can be created from the entity', async () => {
	//         const entity = MockSessionEntity.get();
	//         const dto = SessionResponseDto.create(entity);

	//         expect(dto.id).toEqual(entity.id);
	//         expect(dto.uuid).toEqual(entity.uuid);
	//         expect(dto.createdAt).toEqual(entity.createdAt);

	//         expect(dto.Sessionname).toEqual(entity.Sessionname);
	//         expect(dto.password).toEqual(entity.password);
	//     });
	// });
});
