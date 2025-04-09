import { Injectable, NotImplementedException } from '@nestjs/common';
import { WinstonAdapter } from '../infrastructure/logging/adapters/WinstonAdapter';
import { ILogger } from '../infrastructure/logging/ILogger';
import { AbstractEntity } from './AbstractEntity';

/**
 * An abstract class that provides a base for entity managers.
 * It includes a logger and a method to create entities.
 * The create method is not implemented and should be overridden in derived classes.
 */
@Injectable()
export class AbstractEntityManager<T extends AbstractEntity> {
	protected readonly name: string;
	protected logger: ILogger;

	constructor(protected readonly logAdapter: WinstonAdapter) {
		this.name = this.constructor.name;
		this.logger = logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 * Creates a new entity from the provided data.
	 * @param data The data to create the entity from.
	 * @returns A promise that resolves to the created entity.
	 */
	public async create(_: unknown): Promise<T> {
		this.logger.debug('Creating entity.');
		throw new NotImplementedException(`${this.name}: Create method not implemented`);
	}
}
