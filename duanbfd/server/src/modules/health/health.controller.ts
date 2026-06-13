import { Controller, Get, Logger } from '@nestjs/common';

@Controller('healthz')
export class HealthController {
  // Khởi tạo bộ ghi log mặc định của NestJS
  private readonly logger = new Logger(HealthController.name);

  @Get()
  checkHealth() {
    const uptime = process.uptime();
    const timestamp = new Date().toISOString();

    // Ghi log cơ bản ra terminal mỗi khi endpoint này được gọi
    this.logger.log(`Health check request received - Uptime: ${uptime.toFixed(2)}s`);

    return {
      status: 'OK',
      uptime: `${uptime.toFixed(2)} seconds`,
      timestamp: timestamp,
    };
  }
}