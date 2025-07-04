
{
    "ssl": false,
    "domain": "localhost",
    "port": 3000,
    "events": true
}



EXAMPLE_EXTERNAL_CONFIG=/workspaces/nestjs-demo/config/development/example_external_config.json



/**
 * Example Joi schema for the server's external API configuration.
 */
export const exampleExternalSchema = Joi.object({
    ssl: Joi.boolean().required(),
	domain: Joi.string().required(),
	port: Joi.number().integer().positive().required(),
	events: Joi.boolean().default(false).optional(),
}).required();




/**
 * The server's complete configuration interface.
 * @property exampleExternalConfig - The server's {@link IExternalConfig} settings for the example API.
 */
export interface IServerConfig {
	exampleExternalConfig: IExternalConfig;
}




// Example external configuration
try {
    const exampleExternalConfigPath = path.resolve(process.env.EXAMPLE_EXTERNAL_CONFIG);
    const exampleExternalConfig = fs.readFileSync(externalConfigPath, "utf8");
    const example = JSON.parse(externalConfig);
    config.exampleExternalConfig = example;
} catch (error: Error | unknown) {
    console.error(`serverConfig: Could not load example external API configuration, using fallback configuration: ${error}`);
}



/**
 * JSON schema for the NestJS server.
 */
export const serverJsonSchema = Joi.object({
    exampleExternalConfig: exampleExternalSchema,
}).required();


PROVIDE in a module:
ExternalCrudService,
ExternalEventConsumer,
ExampleExternalFacade

CALL in an object:
protected readonly exampleExternalFacade: ExampleExternalFacade,
await this.exampleExternalFacade.login("/auth/login", { password: data.password });




export class ExampleExternalFacade extends AbstractExternalFacade {
    constructor(
        @Inject(WinstonAdapter)
        protected readonly logAdapter: WinstonAdapter,
        protected readonly configService: ConfigService<IServerConfig>,
        protected readonly service: ExternalCrudService,
        protected readonly consumer: ExternalEventConsumer,
    ) {
        super(logAdapter, configService, service, consumer);
    }

    public processSeverSentEvent(data: unknown): Promise<void> {
        console.log(`WIP DATA`, data);
        return;
    }

    public getEventsUrl(): URL {
        const baseUrl = super.getApiUrl();
        return new URL("v1/user/events", baseUrl);
    }

    public handleLoginResponse(response: unknown): string {
        return response as string;
    }

    protected get configSelector(): keyof IServerConfig {
        return "exampleExternalConfig";
    }
}


--------------------------------------------------




# External Services Integration
The objects in this package provide a framework for integrating with external services, with support for CRUD requests as well as Server-Sent Event (SSE) consumption. It consists of abstract classes that handle the complexities of authentication, CRUD requests, SSE connection management, SSE and event processing.

## Abstract Classes
### AbstractExternalService
This class serves as a template for interacting with external APIs.

#### Responsibilities
- Define connection parameters for external services
- Handle authentication with the external service
- Process events received from the external service

#### Requirements
- Requires a configuration object to know which URLs / endpoints / ports to call.

<hr/>

### AbstractExternalEventConsumer
This class provides a robust way to consume Server-Sent Events (SSE) from external APIs.

#### Responsibilities
- Establish and maintain authenticated SSE connections
- Process incoming events and delegate them to the service
- Handle connection lifecycles (initialization, errors, reconnection, termination)
- Manage correlation IDs for distributed tracing

#### Lifecycle
- Automatically connects on module initialization
- Processes the event stream
- Disconnects cleanly on module destruction

## Implementation Examples
### 1. Create a Service Implementation
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbstractExternalService } from '../services/AbstractExternalService';
import { WinstonAdapter } from '../../infrastructure/logging/adapters/WinstonAdapter';
import { IServerConfig } from '../../infrastructure/configuration/IServerConfig';
import { RequestBuilder } from '../../common/utility/request_builder/RequestBuilder';

@Injectable()
export class ExampleExternalService extends AbstractExternalService {
    constructor(
        @Inject(WinstonAdapter)
        protected readonly logAdapter: WinstonAdapter,
        protected readonly requestBuilder: RequestBuilder,
        protected readonly configService: ConfigService<IServerConfig>,
    ) {
        super(logAdapter, requestBuilder, configService);
    }

    public getApiUrl(): string {
        return "http://api.example.com/v1/endpoint/events";
    }

    public async login(): Promise<string> {
        // Implement authentication logic.
        return "bearer-token";
    }

    public async handleEvent(data: unknown): Promise<void> {
        this.logger.verbose(`Processing user event:`, data);
        // Implement logic to handle the event data
    }

    /* Getters & Setters */

    public get config() {
        return this.configService.get("example");
    }
}
```

### 2. Create a Consumer Implementation
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { AbstractExternalEventConsumer } from '../events/AbstractExternalEventConsumer';
import { WinstonAdapter } from '../../infrastructure/logging/adapters/WinstonAdapter';
import { ExampleExternalService } from '../services/ExampleExternalService';

@Injectable()
export class ExampleExternalEventConsumer extends AbstractExternalEventConsumer {
    constructor(
        @Inject(WinstonAdapter)
        protected readonly logAdapter: WinstonAdapter,
        protected readonly service: ExampleExternalService,
    ) {
        super(logAdapter, service);

        // Optionally configure event types to listen for. 'message' is the default event being listened to.
        this.eventTypes = ['message', /* Other events as per your requirements */];
    }
}
```

### Reconnection Logic
The AbstractExternalEventConsumer handles disconnections and will attempt to reconnect automatically when the stream ends unexpectedly.  

#### Issues
Due to an issue with the underlying `eventsource-client` library, we don't have any logging of reconnection logic.