# Adding a new, or expanding an existing, config object
A short and concise guide on how to add new configs to the server.

### Interfaces
Create an interface (or expand an existing one) for the new config and place it in the [infrastructure/configuration/interfaces/](../src/infrastructure/configuration/interfaces/) directory. Types are also a possibility.  
If an existing interface/type was expanded, continue to the next step.

Otherwise, add the new interface/type to the [IServerConfig](../src/infrastructure/configuration/IServerConfig.ts) interface.  

### Default server configuration
At this point, the server's [fallback configuration object](../src/infrastructure/configuration/serverConfig.ts) will complain and require expansion. Expand accordingly.

### Schemas
Create a new JSON schema, or expand an existing one, for the new config and place it in the [infrastructure/configuration/schemas/](../src/infrastructure/configuration/schemas/) directory.  
If an existing schema was expanded, continue to the next step.

Otherwise, add the new schema to the [serverJsonSchema](../src/infrastructure/configuration/serverJsonSchema.ts) object.

### Loading
If the new config isn't a "root level configuration" object, meaning an existing `config.json` object was expanded and no new `config.json` object was created, you're finished.

Otherwise, we need to load the config at server startup.  
Expand the [serverConfig function](../src/infrastructure/configuration/serverConfig.ts) with a new try-catch statement in an equal fashion to the currently existing try-catch statments, and create a new example environment variable in the [.env.example](../.env.example) file (and your current .env & .env.test files if applicable).

// TODO: Explain what the currently existing config.json objects configure.