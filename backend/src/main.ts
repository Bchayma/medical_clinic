import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  // 🌍 CORS (frontend Next.js)
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true,
  });

  // 🧼 Global validation (DTO protection)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 🔗 Global API prefix
  app.setGlobalPrefix('api');

  // 📘 Swagger configuration
const configSwagger = new DocumentBuilder()
  .setTitle('Clinic API')
  .setDescription('API de gestion clinique')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
    'access-token',
  )
  .build();
  const document = SwaggerModule.createDocument(app, configSwagger);

  SwaggerModule.setup('docs', app, document);

  // 🚀 Start server
  const port = config.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`🚀 Backend clinique démarré sur http://localhost:${port}/api`);
  console.log(`📘 Swagger disponible sur http://localhost:${port}/docs`);
}

bootstrap();