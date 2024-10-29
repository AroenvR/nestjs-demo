import { Test, TestingModule } from '@nestjs/testing';
import { CreateTemplateDto } from '../../../template/dto/CreateTemplateDto';
import { UpdateTemplateDto } from '../../../template/dto/UpdateTemplateDto';
import { TemplateController } from '../../../template/TemplateController';
import { TemplateService } from '../../../template/TemplateService';
import { LogAdapter } from '../../../logging/LogAdapter';
import { mockLogAdapter, mockILogger } from '../../mocks/mockLogAdapter';
import { TemplateEntity } from '../../../template/entity/TemplateEntity';
import { mockService } from '../../mocks/mockService';
import { ICrudController } from '../../../abstract/ICrudController';

// Value to change
describe('TemplateController Unit', () => {
    let entity: TemplateEntity; // Value to change
    let controller: ICrudController<TemplateEntity, CreateTemplateDto, UpdateTemplateDto>; // Value to change

    let className: string;

    const ID = 1;

    beforeEach(async () => {
        entity = new TemplateEntity({ value: 'test' }); // Value to change

        const module: TestingModule = await Test.createTestingModule({
            controllers: [TemplateController], // Value to change
            providers: [
                {
                    useValue: mockService(entity),
                    provide: TemplateService, // Value to change
                },
                {
                    useValue: mockLogAdapter,
                    provide: LogAdapter,
                },
            ],
        }).compile();

        controller = module.get<TemplateController>(TemplateController); // Value to change
        className = controller.constructor.name;
    });

    // --------------------------------------------------

    it('Should be defined', () => {
        expect(controller).toBeDefined();
    });

    // --------------------------------------------------

    it('Can create an entity', async () => {
        const dto = new CreateTemplateDto(); // Value to change

        await expect(controller.create(dto)).resolves.toEqual({ id: 1 });
        expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Creating a new entity`, undefined);
    });

    // --------------------------------------------------

    it('Finds all entities', async () => {
        await expect(controller.findAll()).resolves.toEqual([entity]);
        expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Finding all entities`, undefined);
    });

    // --------------------------------------------------

    it('Finds an entity by its Id', async () => {
        await expect(controller.findOne(ID)).resolves.toEqual({ id: ID, ...entity });
        expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Finding entity with id ${ID}`, undefined);
    });

    // --------------------------------------------------

    it('Updates an entity', async () => {
        const dto = new UpdateTemplateDto(); // Value to change
        dto.value = 'tested'; // Value to change

        entity.value = dto.value; // Value to change

        await expect(controller.update(ID, dto)).resolves.toEqual(entity);
        expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Updating entity with id ${ID}`, undefined);
    });

    // --------------------------------------------------

    it('Deletes an entity', async () => {
        await expect(controller.remove(ID)).resolves.toBeUndefined();
        expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Deleting entity with id ${ID}`, undefined);
    });
});
