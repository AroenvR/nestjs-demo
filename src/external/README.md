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