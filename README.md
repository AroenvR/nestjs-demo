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
It features an expansive testing suite with a 100% coverage.  
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
Execute `npm run test:watch SomeFile.test.ts` to run a specific test on watch, rerunning on each file change.  
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

## Quickly creating a new API endpoint
Two abstract classes were created for quickly setting up new endpoints.  
1. [AbstractController](./src/abstract/AbstractController.ts) for all generic CRUD requests (GET / POST / PATCH / DELETE)  
2. An accompanying [AbstractService](./src/abstract/AbstractService.ts) for connecting to a database. The abstract class only throws a HttpException with METHOD_NOT_IMPLEMENTED as it would be dangerous to accidentally create a fully functional endpoint.

For an example of how to easily set up a new endpoint, refer to the [templates](./src/template/) and [template test](./src/__tests__/template/) directories. They can be utilized for creating new endpoints with the Abstract classes (just copy-paste the templates & change the names).

## My development setup
```bash
npm run start:dev
```

```bash
npm run test:watch
```
[Thunder Client](thunderclient.com) to manually test the API's endpoints.  
[SQLite Viewer](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer) to manually check the database's contents.

## License

Nest, as well as this template, are [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

