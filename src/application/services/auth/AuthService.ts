import { EntityManager, Repository } from "typeorm";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { ILogger } from "../../../infrastructure/logging/ILogger";
import { UserEntity } from "../../../domain/user/UserEntity";
import { CreateLoginDto } from "../../../http_api/dtos/login/CreateLoginDto";
import { RefreshTokenEntity } from "../../../domain/refresh_token/RefreshTokenEntity";
import { IHttpOnlyCookie } from "src/common/interfaces/JwtInterfaces";

/**
 * A service class that provides methods for user authentication and retrieval.
 */
@Injectable()
export class AuthService {
	private readonly name: string;
	protected logger: ILogger;

	constructor(
		protected readonly entityManager: EntityManager,
		protected readonly logAdapter: WinstonAdapter,
		@InjectRepository(UserEntity)
		protected readonly userRepo: Repository<UserEntity>,
		@InjectRepository(RefreshTokenEntity)
		protected readonly tokenRepo: Repository<RefreshTokenEntity>,
	) {
		this.name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 * Authenticates a user based on the provided credentials.
	 * @param data The credentials to authenticate the user.
	 * @returns The authenticated UserEntity if successful.
	 */
	public async authenticate(data: CreateLoginDto): Promise<UserEntity> {
		this.logger.info(`Authenticating a user.`);

		// Implement your authentication logic here
		const user = await this.userRepo.findOne({
			where: { password: data.password },
			relations: [],
		});
		if (!user) throw new BadRequestException(`${this.name}: Authentication failed. User not found.`);

		return user;
	}

	/**
	 * Finds a user by their JWT subject (sub) claim.
	 * @param sub The UUID of the user to find.
	 * @returns The UserEntity if found.
	 */
	public async findUserByCookie(cookie: IHttpOnlyCookie): Promise<UserEntity> {
		this.logger.info(`Finding user for JWT ${cookie.jti}`);

		const token = await this.tokenRepo.findOne({
			where: { jti: cookie.jti },
			relations: [],
		});
		if (!token) throw new UnauthorizedException(`${this.name}: Token with JTI ${cookie.jti} not found.`);

		const user = await this.userRepo.findOne({
			where: { uuid: token.sub },
			relations: [],
		});
		if (!user) throw new UnauthorizedException(`${this.name}: User with UUID ${token.sub} not found.`);

		return user;
	}
}
