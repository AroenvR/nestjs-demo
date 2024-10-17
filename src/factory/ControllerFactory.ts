// import { Body, Controller, HttpStatus, Param, ParseIntPipe, Post, UseFilters, UseGuards } from "@nestjs/common";
// import { AbstractCrudService } from "../abstract/AbstractCrudService"
// import { ICrudController } from "../abstract/ICrudController";
// import { PassportJwtAuthGuard } from "../auth/guards/PassportJwtAuthGuard";
// import { BadRequestExceptionFilter } from "../filters/BadRequestExceptionFilter";
// import { HttpExceptionFilter } from "../filters/HttpExceptionFilter";
// import { NotFoundExceptionFilter } from "../filters/NotFoundExceptionFilter";
// import { NotImplementedExceptionFilter } from "../filters/NotImplementedExceptionFilter";
// import { QueryFailedErrorFilter } from "../filters/QueryFailedErrorFilter";
// import { UnauthorizedExceptionFilter } from "../filters/UnauthorizedExceptionFilter";
// import { ApiResponse } from "@nestjs/swagger";
// import { AbstractCrudEntity } from "src/abstract/AbstractCrudEntity";

// function  CrudControllerFactory<
//     CreateDto,
//     UpdateDto,
//     Entity extends AbstractCrudEntity,
//     Service extends AbstractCrudService<Entity>
//     >(options: {
//         entity: new () => Entity;
//         createDto: new () => CreateDto;
//         updateDto: new () => UpdateDto;
//         serviceToken: string;
//         controllerName: string;
// }): ICrudController {
//     @UseFilters(
//         BadRequestExceptionFilter,
//         HttpExceptionFilter,
//         NotFoundExceptionFilter,
//         NotImplementedExceptionFilter,
//         QueryFailedErrorFilter,
//         UnauthorizedExceptionFilter,
//     )
//     @UseGuards(PassportJwtAuthGuard)
//     @Controller(options.controllerName)
//     class CrudController implements ICrudController {
//         constructor(private readonly service: Service) {}

//         @Post()
//     // @HttpCode(HttpStatus.CREATED)
//     // @ApiOperation({ summary: 'Create a new entity' })
//     @ApiResponse({ status: HttpStatus.CREATED, description: 'The successfully created a new template.', type: options.entity })
//     // @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: HttpExceptionMessages.BAD_REQUEST })
//     // @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: HttpExceptionMessages.INTERNAL_SERVER_ERROR })
//     // @ApiResponse({ status: HttpStatus.NOT_IMPLEMENTED, description: HttpExceptionMessages.NOT_IMPLEMENTED })
//     // @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: HttpExceptionMessages.UNAUTHORIZED })
//     // @UsePipes(
//     //     new ValidationPipe({
//     //         whitelist: true,
//     //         forbidNonWhitelisted: true,
//     //         forbidUnknownValues: true,
//     //         errorHttpStatusCode: HttpStatus.BAD_REQUEST,
//     //         exceptionFactory: (errors: ValidationError[]) => {
//     //             return new BadRequestException(`Create DTO failed validation: ${errors.map((error) => error.toString()).join(', ')}`);
//     //         },
//     //     }),
//     // )
//     public async create(@Body() createDto: CreateDto): Promise<Entity> {
//         // this.logger.info(`Creating a new entity`);
//         return this.service.create(createDto);
//     }

//     // @Get()
//     // @HttpCode(HttpStatus.OK)
//     // @ApiOperation({ summary: 'Find all entities' })
//     // @ApiResponse({ status: HttpStatus.OK, description: 'Request handled successfully.', type: AbstractCrudEntity, isArray: true })
//     // @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: HttpExceptionMessages.BAD_REQUEST })
//     // @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: HttpExceptionMessages.INTERNAL_SERVER_ERROR })
//     // @ApiResponse({ status: HttpStatus.NOT_IMPLEMENTED, description: HttpExceptionMessages.NOT_IMPLEMENTED })
//     // @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: `You shall not pass! (${HttpExceptionMessages.UNAUTHORIZED})` })
//     public async findAll() {
//         // this.logger.info(`Finding all entities`);
//         return this.service.findAll();
//     }

//     /**
//      *
//      */
//     // @Get(':id')
//     // @HttpCode(HttpStatus.OK)
//     // @ApiOperation({ summary: 'Find an entity by id' })
//     // @ApiResponse({ status: HttpStatus.OK, description: 'Request handled successfully.', type: AbstractCrudEntity })
//     // @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: HttpExceptionMessages.BAD_REQUEST })
//     // @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: HttpExceptionMessages.INTERNAL_SERVER_ERROR })
//     // @ApiResponse({ status: HttpStatus.NOT_FOUND, description: HttpExceptionMessages.NOT_FOUND })
//     // @ApiResponse({ status: HttpStatus.NOT_IMPLEMENTED, description: HttpExceptionMessages.NOT_IMPLEMENTED })
//     // @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: `You shall not pass! (${HttpExceptionMessages.UNAUTHORIZED})` })
//     public async findOne(@Param('id', ParseIntPipe) id: number) {
//         // this.logger.info(`Finding entity with id ${id}`);
//         return this.service.findOne(id);
//     }

//     /**
//      *
//      */
//     // @Patch(':id')
//     // @HttpCode(HttpStatus.OK)
//     // @ApiOperation({ summary: 'Update an existing entity' })
//     // @ApiResponse({ status: HttpStatus.OK, description: 'Request handled successfully.', type: AbstractCrudEntity })
//     // @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: HttpExceptionMessages.BAD_REQUEST })
//     // @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: HttpExceptionMessages.INTERNAL_SERVER_ERROR })
//     // @ApiResponse({ status: HttpStatus.NOT_FOUND, description: HttpExceptionMessages.NOT_FOUND })
//     // @ApiResponse({ status: HttpStatus.NOT_IMPLEMENTED, description: HttpExceptionMessages.NOT_IMPLEMENTED })
//     // @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: `You shall not pass! (${HttpExceptionMessages.UNAUTHORIZED})` })
//     // @UsePipes(
//     //     new ValidationPipe({
//     //         whitelist: true,
//     //         forbidNonWhitelisted: true,
//     //         forbidUnknownValues: true,
//     //         errorHttpStatusCode: HttpStatus.BAD_REQUEST,
//     //         exceptionFactory: (errors: ValidationError[]) => {
//     //             return new BadRequestException(`Update DTO failed validation: ${errors.map((error) => error.toString()).join(', ')}`);
//     //         },
//     //     }),
//     // )
//     public async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateDto) {
//         // this.logger.info(`Updating entity with id ${id}`);
//         return this.service.update(id, updateDto);
//     }

//     /**
//      *
//      */
//     // @Delete(':id')
//     // @HttpCode(HttpStatus.NO_CONTENT)
//     // @ApiOperation({ summary: 'Delete an entity' })
//     // @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Request handled successfully.' })
//     // @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: HttpExceptionMessages.BAD_REQUEST })
//     // @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: HttpExceptionMessages.INTERNAL_SERVER_ERROR })
//     // @ApiResponse({ status: HttpStatus.NOT_FOUND, description: HttpExceptionMessages.NOT_FOUND })
//     // @ApiResponse({ status: HttpStatus.NOT_IMPLEMENTED, description: HttpExceptionMessages.NOT_IMPLEMENTED })
//     // @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: `You shall not pass! (${HttpExceptionMessages.UNAUTHORIZED})` })
//     public async remove(@Param('id', ParseIntPipe) id: number) {
//         // this.logger.info(`Deleting entity with id ${id}`);
//         await this.service.remove(id);
//     }
//     }

//     return CrudController;
// }
