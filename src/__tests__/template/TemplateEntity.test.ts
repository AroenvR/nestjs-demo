import { TemplateEntity } from '../../template/entities/TemplateEntity';

describe('TemplateEntity', () => {
	let entity: TemplateEntity;

	beforeEach(() => {
		entity = new TemplateEntity({});
	});

	// --------------------------------------------------

	it('should be defined', () => {
		expect(entity).toBeDefined();
	});
});
