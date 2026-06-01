import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let app: any;

export default async (req: any, res: any) => {
  if (!app) {
    app = await NestFactory.create(AppModule);
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
    
    await app.init();
  }

  // Create Express handler
  const expressHandler = app.getHttpAdapter().getInstance();
  expressHandler(req, res);
};
