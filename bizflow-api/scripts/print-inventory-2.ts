import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { InventoryService } from '../src/inventory/services/inventory.service';

const ID = '6a1bc76806d721f0a2da2020';

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const inventoryService = app.get(InventoryService);
    const inv = await inventoryService.getById(ID as any);
    console.log(JSON.stringify(inv, null, 2));
  } finally {
    await app.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
