import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async testMongoConnection() {
    try {
      if (!this.connection.db) {
        throw new Error('MongoDB connection is not ready');
      }

      await this.connection.db.admin().ping();

      return {
        status: 'Kết nối MongoDB Atlas thành công!',
        database: this.connection.name,
      };
    } catch (error) {
      return {
        status: 'Kết nối thất bại, hãy kiểm tra lại cấu hình!',
        error: error.message,
      };
    }
  }
}
