import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const config = new DocumentBuilder()
    .setTitle('Cơ sở dữ liệu API - Hệ thống quản lý')
    .setDescription(
      'Tài liệu OpenAPI chi tiết dành cho Front-end kết nối hệ thống',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);

  console.log(`Application is running on: http://localhost:3001`);
  console.log(
    `Swagger documentation is available at: http://localhost:3001/api`,
  );
  console.log(`Static uploads: http://localhost:3001/uploads`);
  console.log(`Static folder: ${join(process.cwd(), 'uploads')}`);
}

bootstrap();
