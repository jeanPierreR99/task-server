import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TransformInterceptor } from './common/transform.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, 
      transform: true, 
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
