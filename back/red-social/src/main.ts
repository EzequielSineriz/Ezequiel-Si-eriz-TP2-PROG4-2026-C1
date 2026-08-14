import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import  coockieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    console.log('URI actual:', process.env.MONGO_URI);

   const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.use(coockieParser());
  

  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://localhost:4200', 
      'https://red-social-front-swart.vercel.app',

    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });


  // 📄 CONFIGURACIÓN DE SWAGGER (OPENAPI)
  const config = new DocumentBuilder()
    .setTitle('Paranormal Social Network API 🛸💀')
    .setDescription(
      'Documentación interactiva de la API REST para la red social de investigadores paranormales.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresá tu token JWT para autenticarte',
        in: 'header',
      },
      'JWT-auth', // Nombre de la referencia para los decoradores
    )
    .addTag('Auth', 'Endpoints de registro, inicio de sesión y renovación de token')
    .addTag('Usuarios', 'Gestión de perfiles y administración de miembros')
    .addTag('Publicaciones', 'Muro espectral, filtros, publicaciones y reacciones')
    .addTag('Comentarios', 'Hilos de conversación e interacción entre investigadores')
    .addTag('Estadísticas', 'Métricas de la red y tableros para el rol Administrador')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en el puerto ${port}`);
  console.log(`📄 Documentación de Swagger disponible en: http://localhost:${port}/api/docs`);

  //app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
