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
├── domain/             # Encapsulates core business logic, domain model and its entities.
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
│   ├── filters/        # Exception filters for consistent error handling across the application.
│   ├── guards/         # Guards to enforce authorization and endpoint protection.
│   ├── interceptors/   # Interceptors for transforming data or handling response customization.
│   ├── middleware/     # Middleware for request processing (logging, timing, etc.).
│   ├── modules/        # Modules handle Denpendency Injection and expose their respective Controllers.
│   └── strategies/     # Passport strategies for encapsulating user authentication.
│
└── main.ts             # The application entry point where the NestJS app is bootstrapped.
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

## NestJS object concepts
```mermaid
stateDiagram-v2
    Request_Dataflow_Lifecycle: Request dataflow lifecycle
    Request_Lifecycle: Request dataflow
    Response_Lifecycle: Response dataflow

    Request: HTTP(s) Request <br/> GET /users
    Response: HTTP(s) Response <br/> 200 OK

    Mid1: Middlewares
    Gaurd1: Guards
    Inter1: Interceptors
    Pipe1: Pipes
    Cont1: Controllers
    Serv1: Services

    Mid2: Middlewares
    Gaurd2: Guards
    Inter2: Interceptors
    Pipe2: Pipes
    Cont2: Controllers
    Serv2: Services

    Request --> Request_Lifecycle

    state Request_Dataflow_Lifecycle {
        state Request_Lifecycle {
            [*] --> Mid1
            Mid1 --> Gaurd1
            Gaurd1 --> Inter1
            Inter1 --> Pipe1
            Pipe1 --> Cont1
            Cont1 --> Serv1
        }

        state Response_Lifecycle {
            Serv2 --> Cont2
            Cont2 --> Pipe2
            Pipe2 --> Inter2 
            Inter2 --> Gaurd2
            Gaurd2 --> Mid2 
            Mid2 --> [*] 
        }
    }

    Response_Lifecycle --> Response
```

## Middlewares
Has access to the `request` and `response` objects and is the first and last object to be called during a request/response cycle.

## Guards
Usually a security check, such as validating JWT's on any controller that implements the Guard before data is given to the data's handler.

## Interceptors
An Interceptor ...? TODO

## Pipes
Used for validating and transforming data before passing it to the data's handler.

## License
NestJS, as well as this template, are [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).