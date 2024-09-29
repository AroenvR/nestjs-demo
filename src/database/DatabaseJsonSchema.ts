/**
 * The JSON schema for the database configuration settings.
 */
export const databaseJSONSchema = {
	type: 'object',
	properties: {
		driver: { type: 'string', enum: ['sqlite', 'postgres'] },
		synchronize: { type: 'boolean' },
		database: { type: 'string' },
		host: { type: 'string' },
		port: { type: 'number' },
		username: { type: 'string' },
		password: { type: 'string' },
	},
	required: ['driver', 'database'],
	allOf: [
		{
			if: { properties: { driver: { const: 'sqlite' } } },
			then: {
				required: ['database', 'synchronize'],
			},
		},
		{
			if: { properties: { driver: { const: 'postgres' } } },
			then: {
				required: ['database', 'synchronize', 'host', 'port', 'username', 'password'],
			},
		},
	],
};
