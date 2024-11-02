// import { EntityManager, Repository } from "typeorm";
// import { Injectable, NotImplementedException } from "@nestjs/common";
// import { ILogger } from "ts-log-adapter";
// import { AbstractEntity } from "../../domain/entities/AbstractEntity";
// import { LogAdapter } from "../../infrastructure/logging/LogAdapter";
// import { CreateDto } from "../dtos/CreateDto";
// import { ResponseDto } from "../dtos/ResponseDto";
// import { UpdateDto } from "../dtos/UpdateDto";
// import { Observable, Subject } from "rxjs";
// import { ISseMessage } from "../events/ISseMessage";
// import { IService } from "./IService";

// /**
//  * An abstract service class that provides basic CRUD operations.
//  * A default implementation will only throw the `Method not implemented` exception.
//  */
// @Injectable()
// export class AbstractService implements IService<CreateDto, UpdateDto, ResponseDto> {
//     protected logger: ILogger;
//     protected readonly events = new Subject<ISseMessage<ResponseDto>>();

//     constructor(
//         protected readonly repository: Repository<unknown>,
//         protected readonly entityManager: EntityManager,
//         protected readonly logAdapter: LogAdapter,
//     ) {
//         this.logger = logAdapter.getPrefixedLogger(this.constructor.name);
//     }

//     /**
//      *
//      */
//     public async create(_: CreateDto): Promise<ResponseDto> {
//         throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
//     }

//     /**
//      *
//      */
//     public async findAll(): Promise<ResponseDto[]> {
//         throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
//     }

//     /**
//      *
//      */
//     public async findOne(id: number): Promise<ResponseDto> {
//         throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
//     }

//     /**
//      *
//      */
//     public async update(id: number, _: UpdateDto): Promise<ResponseDto> {
//         throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
//     }

//     /**
//      *
//      */
//     public async remove(id: number): Promise<void> {
//         throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
//     }

//     /**
//      *
//      */
//     public observe(): Observable<ISseMessage<ResponseDto>> {
//         throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
//     }

//     /**
//      *
//      */
//     public emit(entity: AbstractEntity): void {
//         throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
//     }
// }
