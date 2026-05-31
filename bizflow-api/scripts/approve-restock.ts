import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RestockService } from '../src/restocks/services/restock.service';
import { InventoryService } from '../src/inventory/services/inventory.service';

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const restockService = app.get(RestockService);
    const inventoryService = app.get(InventoryService);
    const restocks = await restockService.getRestocksByOrganization(
      '6a1adffdc7d02c6abbda64d3',
      '6a1b5aadf055162aafcd2ae2',
      1,
      20,
    );
    const target = restocks.data.find((item: any) => item.referenceNumber === 'RST-0004');
    if (!target) {
      console.log('RESTOCK_NOT_FOUND');
      return;
    }

    const approved = await restockService.approveRestockRequest(
      target._id.toString(),
      { approvalNotes: 'Approved via script' },
      '6a1adffdc7d02c6abbda64d2',
    );

    const inventory = await inventoryService.getById('6a1be71efe815048984c9bd0');
    console.log(JSON.stringify({ restockStatus: approved.status, quantity: inventory.quantity }, null, 2));
  } finally {
    await app.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
