import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  
  // Configure CORS for production and development
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:4200';
  const corsOriginArray = corsOrigin.includes(',') 
    ? corsOrigin.split(',').map(origin => origin.trim())
    : [corsOrigin];
  
  app.enableCors({
    origin: corsOriginArray,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
