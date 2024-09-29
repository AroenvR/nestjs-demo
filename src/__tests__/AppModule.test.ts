import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../AppModule';
import { LoggerMiddleware } from '../middleware/LoggerMiddleware';
import { AllExceptionsFilter } from '../filters/AllExceptionsFilter';
import { APP_FILTER } from '@nestjs/core';

describe('AppModule', () => {
    let appModule: AppModule;

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        appModule = moduleRef.get<AppModule>(AppModule);
    });

    // --------------------------------------------------

    it('should be defined', () => {
        expect(appModule).toBeDefined();
    });

    // --------------------------------------------------

    it('should apply LoggerMiddleware globally', () => {
        const consumerMock = {
            apply: jest.fn().mockReturnThis(),
            forRoutes: jest.fn(),
        };

        appModule.configure(consumerMock as any);

        expect(consumerMock.apply).toHaveBeenCalledWith(LoggerMiddleware);
        expect(consumerMock.forRoutes).toHaveBeenCalledWith('*');
    });

    // --------------------------------------------------

    it('should provide AllExceptionsFilter as APP_FILTER', () => {
        const providers = Reflect.getMetadata('providers', AppModule);
        const appFilterProvider = providers.find((provider: any) => provider.provide === APP_FILTER && provider.useClass === AllExceptionsFilter);
        expect(appFilterProvider).toBeDefined();
    });

    // --------------------------------------------------

    it("Can execute a GET request which returns a 'not yet implemented'", async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        const app = moduleFixture.createNestApplication();
        await app.init();

        await request(app.getHttpServer()).post('/template').send({}).expect(501);
    });
});
