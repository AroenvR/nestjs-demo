import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeleteEndpoint } from '../../decorators/DeleteEndpoint';
import { PatchEndpoint } from '../../decorators/PatchEndpoint';
import { GetByIdEndpoint } from '../../decorators/GetByIdEndpoint';
import { SseEndpoint } from '../../decorators/SseEndpoint';
import { GetEndpoint } from '../../decorators/GetEndpoint';
import { PostEndpoint } from '../../decorators/PostEndpoint';
import { CreateUserDto } from '../../dtos/user/CreateUserDto';
import { UpdateUserDto } from '../../dtos/user/UpdateUserDto';
import { UserResponseDto } from '../../dtos/user/UserResponseDto';
import { UserService } from '../../../application/services/user/UserService';
import { GuardedController } from '../GuardedController';
import { WinstonAdapter } from '../../../infrastructure/logging/adapters/WinstonAdapter';

const ENDPOINT = 'user'; // Just finished the unit test, on to the integration and the module tests.

// NOTE: Endpoint ordering is important for NestJS to correctly resolve the routes
@Controller(ENDPOINT)
@ApiTags(ENDPOINT)
export class UserController extends GuardedController {
	constructor(
		protected readonly logAdapter: WinstonAdapter,
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
		return super.update(id, updateDto);
	}

	@DeleteEndpoint(ENDPOINT)
	public async remove(id: number) {
		return super.remove(id);
	}
}
