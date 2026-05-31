import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RestockService } from '../src/restocks/services/restock.service';

const TARGET_ID = '6a1beaeec9387333baf4bb62';

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const restockService = app.get(RestockService);
    const restock = await restockService.getById(TARGET_ID as any);
    console.log(JSON.stringify(restock, null, 2));
  } finally {
    await app.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
