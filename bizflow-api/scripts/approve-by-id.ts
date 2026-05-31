import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RestockService } from '../src/restocks/services/restock.service';

const TARGET_ID = '6a1beaeec9387333baf4bb62';

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const restockService = app.get(RestockService);
    const approved = await restockService.approveRestockRequest(
      TARGET_ID,
      { approvalNotes: 'Approved via automated script' },
      '6a1adffdc7d02c6abbda64d2',
    );
    console.log('Approved:', JSON.stringify(approved, null, 2));
  } finally {
    await app.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
