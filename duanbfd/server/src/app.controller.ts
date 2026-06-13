import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Tạo một endpoint: http://localhost:3001/test-db
  @Get('test-db')
  async testDb() {
    return await this.appService.testMongoConnection();
  }
}
