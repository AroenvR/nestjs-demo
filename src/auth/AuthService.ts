import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LogAdapter } from '../logging/LogAdapter';
import { AbstractLoggingClass } from '../abstract/AbstractLoggingClass';

type TSignInData = null;
type TAuthResult = boolean;

/**
 * An authentication service interface.
 */
export interface IAuthService {
	/**
	 *
	 * @param input
	 */
	validate(input: TSignInData): Promise<TAuthResult>;

	/**
	 *
	 */
	authenticate(): Promise<TAuthResult>;

	/**
	 *
	 */
	login(): Promise<TAuthResult>;
}

@Injectable()
export class AuthService extends AbstractLoggingClass implements IAuthService {
	constructor(protected readonly logAdapter: LogAdapter) {
		super(logAdapter);
	}

	/**
	 *
	 */
	public async validate(input: TSignInData): Promise<TAuthResult> {
		this.logger.info(`Validating user input`);

		return true;
	}

	/**
	 *
	 */
	public async authenticate(): Promise<TAuthResult> {
		this.logger.info(`Authenticating user`);

		if (!(await this.validate(null))) throw new UnauthorizedException();

		return true;
	}

	/**
	 *
	 */
	public async login() {
		this.logger.info(`Logging in user`);

		return true;
	}
}
