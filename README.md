<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description
This is a pre-configured [NestJS](https://nestjs.com/) template with middlewares, logging, database connection, quick-and-easy endpoint implementation, ...  
It features an expansive testing suite with over 90% coverage.  
It generates no linting errors / warnings.  

## Project setup
#### Clone the repository with
```bash
git clone https://github.com/AroenvR/nestjs-demo.git
```

### Enter the new directory
```
cd nestjs-demo
```

#### Install dependencies
```bash
npm install
```

## Compile and run the project
```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Running tests
Execute `npm run test` to run all tests once.  
Execute `npm run test:watch` to run all tests on watch, rerunning on each file change.  
Execute `npm run test SomeFile.test.ts` to run a specific test once.  
Execute `npm run test something` to run all files with a specific prefix once.  
Execute `npm run test:watch SomeFile.test.ts` to run a specific test on watch, rerunning on each file change.  
Execute `npm run test:watch something` to run all files with a specific prefix on watch, rerunning on each file change.  
Execute `npm run test:coverage` to run all test once with a coverage report.

## Resources
Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

# This project's file structure adheres to Domain Driven Design.
```plaintext
src/
├── application/        # Coordinates use cases of the application without direct business logic.
│   ├── events/         # Application services which emit events triggered by database operations.
│   └── services/       # Application services orchestrating domain services and repository interactions.
│
├── common/             # Contains values that are used accross layers.
│   ├── constants/      # Constants that are used by multiple layers.
│   └── enums/          # Enums that are used by multiple layers.
│
├── domain/             # Encapsulates core business logic, the domain model and its entities.
│   └── AbstractEntity  # The parent class for all entities in the application.
│
├── infrastructure/     # Provides technical capabilities to support application and domain layers.
│   ├── configuration/  # Manages application configuration and environment variables.
│   ├── database/       # Responsible for the application's database access.
│   ├── logging/        # The application's logging mechanisms.
│   └── AppModule       # The application's primary module, and IOC container.
|
├── http_api/           # Encapsulates the application's HTTP interface.
│   ├── controllers/    # HTTP request handlers routing requests to the application's services.
│   ├── decorators/     # Custom decorators for Swagger documentation and request routing for Controllers.
│   ├── dtos/           # Data Transfer Objects that define data structures and handle validation.
│   ├── filters/        # Exception filters for capturing and handling endpoint errors.
│   ├── guards/         # Guards to enforce authorization and endpoint protection.
│   ├── interceptors/   # Interceptors for transforming data or handling response customization.
│   ├── middleware/     # Middleware for request processing (logging, timing, etc.).
│   ├── modules/        # Modules handle Denpendency Injection and expose their respective Controllers.
│   └── strategies/     # Passport strategies for encapsulating user authentication.
│
└── main.ts             # The application's entry point where the NestJS app is bootstrapped.
```

## My development setup
```bash
npm run start:dev
```

```bash
npm run test:watch
```
[Bash scripts](./scripts/) to manually test the API's endpoints.  
[SQLite Viewer](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer) to manually check the database's contents.  
[Simple Browser](https://github.com/microsoft/vscode/pull/109276) to review the OpenAPI document (Ctrl + Shift + P > Simple Browser: Show)

## NestJS dataflow
```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Guard
    participant Pipe
    participant Interceptor
    participant Controller
    participant Service
    participant Filter

    Client->>Middleware: HTTP Request

    Note over Middleware: Log/Parse request
    Middleware->>Guard: Pass Request
    Guard-->>Middleware: Allow/Deny
    Middleware->>Pipe: Pass Request

    Note over Pipe: Validate/Modify data
    Pipe->>Interceptor: 

    Note over Interceptor: Transform/Cache data
    Interceptor->>Controller: 

    Note over Controller: Pass to correct service
    Controller->>Service: 

    Note over Service: Execute business logic
    Service-->>Controller: Response Data
    Controller-->>Interceptor: Response Data

    Note over Interceptor: Validate/Transform Data
    Interceptor-->>Middleware: 

    Note over Middleware: Log/Parse response
    Middleware-->>Client: HTTP success
    alt Error Occurs
        Service-->>Filter: Throw Exception

        Note over Middleware: Log/Parse Error response
        Filter-->>Client: HTTP Error response
    end
```

## Middlewares
Middlewares in NestJS are functions that have access to the **request** and **response** objects, as well as the **next middleware** in the request-response cycle. They are executed before any route handlers, making them ideal for tasks like logging, authentication, and modifying requests. Middlewares are the first and last points of interaction during a request/response cycle, allowing for centralized processing of incoming requests and outgoing responses.

#### Key points:
- **Request Modification**: Alter or enrich incoming request data before it reaches the controller.
- **Logging**: Track and log details of each incoming request for monitoring and debugging.
- **Authentication & Authorization**: Validate user credentials and permissions before accessing protected routes.
- **Error Handling**: Catch and process errors uniformly across all routes.
- **Performance Enhancements**: Implement caching or rate limiting to optimize application performance.

## Guards
Guards in NestJS are used to determine whether a request will be handled by the route handler based on custom logic, typically for authentication and authorization. They implement the CanActivate interface and return a boolean indicating whether to proceed. Guards are executed before any interceptor or pipe, making them ideal for access control checks.

#### Key points:
- **Authentication**: Validate user credentials, such as verifying JWT tokens.
- **Authorization**: Check user roles or permissions to access specific resources.
- **Request Control**: Allow or deny requests before they reach the controller.
- **Scope Flexibility**: Apply guards globally, to controllers, or individual routes.
- **Reusable Security Logic**: Centralize access control logic for consistency and maintainability.

## Interceptors
Interceptors in NestJS allow you to intercept and manipulate incoming requests and outgoing responses. They are useful for implementing cross-cutting concerns such as logging, transforming data, handling errors, and caching. By implementing the NestInterceptor interface, you can add custom logic before and after the execution of route handlers. Interceptors can be applied globally, to specific controllers, or individual routes.

#### Key points:
- **Logging & Monitoring**: Track request durations and details.
- **Response Transformation**: Modify or format response data.
- **Error Handling**: Standardize exception handling across the application.
- **Caching:** Implement response caching to improve performance.

## Pipes
Pipes in NestJS are used to validate and transform incoming data before it reaches the route handlers. They implement the PipeTransform interface and can be applied globally, to specific controllers, or individual routes. Pipes ensure data integrity by enforcing validation rules and transforming data into the desired format. They help maintain consistency and reduce boilerplate code by handling common data processing tasks.

#### Key points:
- **Validation**: Ensure incoming data meets required criteria using built-in or custom validators.
- **Transformation**: Convert data types or formats to match expected handler inputs.
- **Parameter Handling**: Process and validate route parameters, query strings, and request bodies.
- **Reusable Logic**: Create generic pipes that can be reused across different parts of the application.
- **Error Handling**: Provide meaningful error messages when data validation fails.

## Filters
Filters in NestJS, specifically Exception Filters, handle and manage exceptions that occur during the request-response cycle. They provide a centralized mechanism to catch errors, transform them into meaningful responses, and ensure consistent error handling across the application. Filters implement the ExceptionFilter interface and can be applied globally, to specific controllers, or individual routes. By separating error handling from business logic, filters enhance code maintainability and clarity. They also integrate seamlessly with logging systems to record error details for debugging purposes.

#### Key points:
- **Centralized Error Handling**: Manage all exceptions in a single location for consistency.
- **Custom Error Responses**: Transform exceptions into standardized, client-friendly messages.
- **Separation of Concerns**: Isolate error handling from business logic for cleaner code.
- **Scope Flexibility**: Apply filters globally, to controllers, or individual routes.
- **Integration with Logging**: Combine with logging mechanisms to record error details for debugging.

# License
NestJS, as well as this template, are [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).