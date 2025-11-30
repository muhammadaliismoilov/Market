import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);

  const PORT = process.env.PORT || 4000;

  const config = new DocumentBuilder()
    .setTitle('Market API') 
    .setDescription('Market project API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'JWT tokenni kiriting: Bearer <token>',
        in: 'header',
      },
      'bearer',
    )
    .build();
  const document = require('@nestjs/swagger').SwaggerModule.createDocument(app, config);
  require('@nestjs/swagger').SwaggerModule.setup('api/docs', app, document);

 
  await app.listen(PORT,  () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📖 Swagger docs: http://localhost:${PORT}/api/docs`);
  });
}
bootstrap();
