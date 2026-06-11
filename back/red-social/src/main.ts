import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import  coockieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.use(coockieParser());
  

  app.enableCors({
    origin: [
      'http://localhost:4200', // Tu front local
      'https://red-social-front-swart.vercel.app/' // 👈 La URL que te dé Vercel para tu Front
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  //app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
