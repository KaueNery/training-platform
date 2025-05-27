import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:8081',
    redentials: true,      
  })

  const config = new DocumentBuilder()
    .setTitle('Training Platform API')
    .setDescription('User & Workout CRUD APIs')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // ✅ Serve Swagger at /api

  await app.listen(3000);
}
bootstrap();
