import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { InventoryService } from '../src/inventory/services/inventory.service';

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const inventoryService = app.get(InventoryService);
    const inventory = await inventoryService.getById('6a1be71efe815048984c9bd0');
    console.log(JSON.stringify(inventory, null, 2));
  } finally {
    await app.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
