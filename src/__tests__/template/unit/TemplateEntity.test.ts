import { TemplateEntity } from '../../../template/entities/TemplateEntity';

describe('TemplateEntity', () => {
	let entity: TemplateEntity;

	beforeEach(() => {
		entity = new TemplateEntity({ value: 'test' });
	});

	// --------------------------------------------------

	it('should be defined', () => {
		expect(entity).toBeDefined();
		expect(entity).toBeInstanceOf(TemplateEntity);
		expect(entity.value).toBeTruthy();
	});
});
