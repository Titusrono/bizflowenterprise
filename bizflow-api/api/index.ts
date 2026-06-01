import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any;

async function initializeApp() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      logger: false,
    });
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
  return app;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const nestApp = await initializeApp();
    const server = nestApp.getHttpAdapter().getInstance();
    server(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
