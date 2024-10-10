import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LogAdapter } from '../logging/LogAdapter';
import { AbstractLoggingClass } from '../abstract/AbstractLoggingClass';
import { randomUUID } from 'crypto';

export const CURRENT_JWT_VERSION = 1;

export type TSignInData = { username: string; password: string };

export type TJwtPayload = { sub: string; username: string; sessionId: string; version: number };

export type TAuthResult = { accessToken: string };

/**
 * An authentication service interface.
 */
export interface IAuthService {
    /**
     *
     * @param data
     */
    validate(data: TSignInData): Promise<TSignInData>;

    /**
     *
     */
    login(data: TSignInData): Promise<TAuthResult>;

    /**
     *
     */
    logout(): Promise<void>;
}

@Injectable()
export class AuthService extends AbstractLoggingClass implements IAuthService {
    constructor(
        protected readonly logAdapter: LogAdapter,
        protected readonly jwtService: JwtService,
    ) {
        super(logAdapter);
    }

    /**
     *
     */
    public async validate(data: TSignInData): Promise<TSignInData> {
        this.logger.info(`Validating user ${data.username}`);

        if (!data.username || !data.password) throw new HttpException('Username and password are required', HttpStatus.BAD_REQUEST);

        return { username: data.username, password: data.password };
    }

    /**
     *
     */
    public async login(data: TSignInData) {
        this.logger.info(`Logging in user ${data.username}`);

        await this.validate(data);

        const tokenPayload: TJwtPayload = {
            sub: '69',
            username: 'Bob',
            sessionId: randomUUID().toString(),
            version: CURRENT_JWT_VERSION,
        };

        this.logger.info(`Signing JWT`);
        const token = await this.jwtService.signAsync(tokenPayload);

        return { accessToken: token };
    }

    /**
     *
     */
    public async logout() {
        this.logger.info(`Logging out user`);
    }
}