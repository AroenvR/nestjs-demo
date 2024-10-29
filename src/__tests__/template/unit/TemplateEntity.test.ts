import { TemplateEntity } from '../../../template/entity/TemplateEntity';

// Value to change
describe('TemplateEntity', () => {
    let entity: TemplateEntity; // Value to change

    beforeEach(() => {
        entity = new TemplateEntity({ value: 'test' }); // Value to change
    });

    // --------------------------------------------------

    it('should be defined', () => {
        expect(entity).toBeDefined();
        expect(entity).toBeInstanceOf(TemplateEntity); // Value to change
        expect(entity.value).toBeTruthy(); // Value to change
    });
});
