import { Controller, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { isTruthy } from 'ts-istruthy';
import { NestLogger } from '../../../infrastructure/logging/NestLogger';
import { DeleteEndpoint } from '../../../common/decorators/DeleteEndpoint';
import { PatchEndpoint } from '../../../common/decorators/PatchEndpoint';
import { GetByIdEndpoint } from '../../../common/decorators/GetByIdEndpoint';
import { SseEndpoint } from '../../../common/decorators/SseEndpoint';
import { GetEndpoint } from '../../../common/decorators/GetEndpoint';
import { PostEndpoint } from '../../../common/decorators/PostEndpoint';
import { CreateUserDto } from '../../../application/dtos/user/CreateUserDto';
import { UpdateUserDto } from '../../../application/dtos/user/UpdateUserDto';
import { UserResponseDto } from '../../../application/dtos/user/UserResponseDto';
import { UserService } from '../../../application/services/user/UserService';
import { GuardedController } from '../GuardedController';

const ENDPOINT = 'user'; // Just finished the unit test, on to the integration and the module tests.

// NOTE: Endpoint ordering is important for NestJS to correctly resolve the routes
@Controller(ENDPOINT)
@ApiTags(ENDPOINT)
export class UserController extends GuardedController {
	constructor(
		protected readonly logAdapter: NestLogger,
		protected readonly service: UserService,
	) {
		super(logAdapter, service);
	}

	@PostEndpoint(ENDPOINT, UserResponseDto)
	public async create(createDto: CreateUserDto) {
		return super.create(createDto);
	}

	@GetEndpoint(ENDPOINT, UserResponseDto)
	public async findAll() {
		return super.findAll();
	}

	@SseEndpoint(ENDPOINT, UserResponseDto)
	public events() {
		return super.events();
	}

	@GetByIdEndpoint(ENDPOINT, UserResponseDto)
	public async findOne(id: number) {
		return super.findOne(id);
	}

	@PatchEndpoint(ENDPOINT, UserResponseDto)
	public async update(id: number, updateDto: UpdateUserDto) {
		if (!isTruthy(id)) throw new HttpException('ID is empty', HttpStatus.BAD_REQUEST);
		if (!isTruthy(updateDto)) throw new HttpException('Payload is empty', HttpStatus.BAD_REQUEST);
		return super.update(id, updateDto);
	}

	@DeleteEndpoint(ENDPOINT)
	public async remove(id: number) {
		return super.remove(id);
	}
}
