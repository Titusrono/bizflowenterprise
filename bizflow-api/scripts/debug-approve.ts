import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RestockService } from '../src/restocks/services/restock.service';

const ID = '6a1beaeec9387333baf4bb62';

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const svc = app.get(RestockService) as any;
    console.log('Fetching current...');
    const current = await svc.restockRepository.findById(ID);
    console.log('current:', JSON.stringify(current, null, 2));

    const lineItems = current.lineItems;
    console.log('Resolved lineItems:', JSON.stringify(lineItems, null, 2));

    for (const li of lineItems) {
      console.log('Increasing inventory for', li.inventoryId, 'by', li.approvedQuantity);
      const inv = await svc.inventoryService.getById(li.inventoryId as any);
      console.log('Before inventory qty:', inv.quantity);
      const directUpdate = await svc.inventoryRepository.getModel().findByIdAndUpdate(li.inventoryId.toString(), { $inc: { quantity: Number(li.approvedQuantity) }, $set: { lastStockedAt: new Date(), updatedBy: 'script-user' } }, { new: true }).lean().exec();
      console.log('Direct update result qty:', directUpdate?.quantity);
      const invAfter = await svc.inventoryService.getById(li.inventoryId as any);
      console.log('After inventory qty:', invAfter.quantity);
    }

    const updated = await svc.restockRepository.updateById(ID, {
      status: 'approved',
      approvedBy: 'script-user',
      approvedAt: new Date(),
    } as any, 'script-user');

    console.log('updateById result:', JSON.stringify(updated, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await app.close();
  }
})();
