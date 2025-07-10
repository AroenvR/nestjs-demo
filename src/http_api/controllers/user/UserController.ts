import { UUID } from "crypto";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DeleteEndpoint } from "../../decorators/DeleteEndpoint";
import { PatchEndpoint } from "../../decorators/PatchEndpoint";
import { GetByUuidEndpoint } from "../../decorators/GetByUuidEndpoint";
import { SseEndpoint } from "../../decorators/SseEndpoint";
import { GetEndpoint } from "../../decorators/GetEndpoint";
import { PostEndpoint } from "../../decorators/PostEndpoint";
import { CreateUserDto } from "../../dtos/user/CreateUserDto";
import { UpdateUserDto } from "../../dtos/user/UpdateUserDto";
import { UserResponseDto } from "../../dtos/user/UserResponseDto";
import { GuardedController } from "../GuardedController";
import { UserEntity } from "../../../domain/user/UserEntity";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { UserService } from "../../../application/services/user/UserService";
import { TransformResponseDto } from "../../../http_api/decorators/TransformResponseDto";

const ENDPOINT = "user"; // Just finished the unit test, on to the integration and the module tests.

// NOTE: Endpoint ordering is important for NestJS to correctly resolve the routes
@Controller(ENDPOINT)
@ApiTags(ENDPOINT)
@TransformResponseDto(UserResponseDto)
export class UserController extends GuardedController<UserEntity> {
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

	@GetByUuidEndpoint(ENDPOINT, UserResponseDto)
	public async findOne(uuid: UUID) {
		return super.findOne(uuid);
	}

	@PatchEndpoint(ENDPOINT, UserResponseDto)
	public async update(uuid: UUID, updateDto: UpdateUserDto) {
		return super.update(uuid, updateDto);
	}

	@DeleteEndpoint(ENDPOINT)
	public async remove(uuid: UUID) {
		return super.remove(uuid);
	}
}
