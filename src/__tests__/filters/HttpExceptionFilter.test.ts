import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { Controller, Get, HttpException, HttpStatus, INestApplication, UseFilters } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionMessages } from '../../common/enums/HttpExceptionMessages';
import { HttpExceptionFilter } from '../../common/filters/HttpExceptionFilter';
import { LoggerModule } from '../../infrastructure/logging/LoggerModule';
import { serverConfig } from '../../infrastructure/configuration/serverConfig';
import { ILogger, IPrefixedLogger } from '../../infrastructure/logging/ILogger';
import { NewWinstonAdapter } from '../../infrastructure/logging/adapters/NewWinstonAdapter';
// import { mockILogger } from '../mocks/mockLogAdapter';

@Controller('test')
@UseFilters(HttpExceptionFilter)
class TestController {
    @Get()
    hello() {
        throw new HttpException('HTTP exception test', HttpStatus.BAD_REQUEST);
    }
}

/* 
    Can't test the logs for some reason. It always says that it isn't being called
    The app does compile, but the correlation ID's are broken.
    Still need to rename the NewWinstonAdapter to an abstract and then create the winston one.
*/

const mockILogger: jest.Mocked<IPrefixedLogger> = {
    verbose: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    critical: jest.fn(),
    // config: {} as any, // Mock necessary config
    correlationManager: {} as any, // Mock correlation manager
    getPrefixedLogger: jest.fn().mockReturnValue({
        // config: {} as any, // Mock necessary config
        correlationManager: {} as any, // Mock correlation manager
        verbose: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        critical: jest.fn(),
    }),
}

describe('HttpExceptionFilter', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [TestController],
            providers: [
                {
                    useValue: mockILogger,
                    provide: NewWinstonAdapter,
                },
            ]
            // imports: [
            //     ConfigModule.forRoot({
            //         isGlobal: true,
            //         load: [serverConfig],
            //     }),
            //     LoggerModule
            // ],
        })
            // .overrideProvider(NewWinstonAdapter)
            // .useValue(mockILogger)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Retrieve the same logger instance used in the filter
        // logger = moduleFixture.get<IPrefixedLogger>(NewWinstonAdapter);
    });

    afterAll(async () => {
        await app.close();
    });

    // --------------------------------------------------

    it('Should handle its own errors', async () => {
        await request(app.getHttpServer())
            .get('/test')
            .expect(HttpStatus.INTERNAL_SERVER_ERROR)
            .expect((res) => {
                expect(res.body).toEqual({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    timestamp: expect.any(Number),
                    path: '/test',
                    message: HttpExceptionMessages.INTERNAL_SERVER_ERROR,
                });
            });

        // Verify that the logger was called
        expect(mockILogger.error).toHaveBeenCalledWith(`HttpExceptionFilter: HttpException: HTTP exception test`, undefined);
        expect(mockILogger.warn).toHaveBeenCalledWith(`HttpExceptionFilter: Exception was caught by the default HTTP exception filter.`, undefined);
    });
});
