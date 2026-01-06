import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // TO'G'RILANDI: require o'rniga import qilindi
import { ValidationPipe } from '@nestjs/common';
import { DateFormatInterceptor } from './common/interceptors/date-format.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // register interceptor globally so all requests/responses get date formatting
  app.useGlobalInterceptors(new DateFormatInterceptor());

  // TO'G'RILANDI: CORS origin environment variable ga bog'landi
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173']; // Default development origins

  app.enableCors({
    origin: corsOrigins,
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
  // TO'G'RILANDI: require o'rniga import qilingan SwaggerModule ishlatildi
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // TO'G'RILANDI: listen callback o'rniga, listen tugagandan keyin log qilindi
  await app.listen(PORT);
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📖 Swagger docs: http://localhost:${PORT}/api/docs`);
}
bootstrap();
