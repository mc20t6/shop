import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const appService = {
    testMongoConnection: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService.testMongoConnection.mockResolvedValue({ status: 'OK' });
  });

  describe('root', () => {
    it('should call test database connection', async () => {
      await expect(appController.testDb()).resolves.toEqual({ status: 'OK' });
      expect(appService.testMongoConnection).toHaveBeenCalled();
    });
  });
});
