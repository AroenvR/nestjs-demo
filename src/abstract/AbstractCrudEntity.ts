// import { PrimaryGeneratedColumn } from 'typeorm';
// import { ICrudEntity } from './ICrudEntity';
// import { ApiProperty } from '@nestjs/swagger';

// /**
//  * An abstract entity class that provides a unique auto-generated identifier.
//  * @column id INTEGER PRIMARY KEY AUTOINCREMENT
//  */
// export abstract class AbstractCrudEntity implements ICrudEntity {
// 	@PrimaryGeneratedColumn()
// 	@ApiProperty({ description: 'Unique identifier of the entity', uniqueItems: true })
// 	id: number;

// 	constructor(entity: Partial<AbstractCrudEntity>) {
// 		Object.assign(this, entity);
// 	}
// }
