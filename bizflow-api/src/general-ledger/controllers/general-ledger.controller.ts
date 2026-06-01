import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GeneralLedgerService } from '../services/general-ledger.service';
import { GeneralLedgerQueryDto, TrialBalanceQueryDto } from '../dto/general-ledger.dto';

@Controller('accounting/general-ledger')
export class GeneralLedgerController {
  constructor(private readonly glService: GeneralLedgerService) {}

  /**
   * Get GL entries for an account
   */
  @Get('account/:accountId')
  async getAccountLedger(
    @Param('accountId') accountId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 100,
    @Request() req: any,
  ) {
    return this.glService.getAccountLedger(accountId, req.user?.organizationId, page, limit);
  }

  /**
   * Get GL entries by date range
   */
  @Get('account/:accountId/date-range')
  async getLedgerByDateRange(
    @Param('accountId') accountId: string,
    @Request() req: any,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 100,
  ) {
    return this.glService.getLedgerByDateRange(
      accountId,
      fromDate ? new Date(fromDate) : new Date(),
      toDate ? new Date(toDate) : new Date(),
      req.user?.organizationId,
      page,
      limit,
    );
  }

  /**
   * Get GL entries by period
   */
  @Get('account/:accountId/period/:period')
  async getLedgerByPeriod(
    @Param('accountId') accountId: string,
    @Param('period') period: string,
    @Request() req: any,
  ) {
    return this.glService.getLedgerByPeriod(period, accountId, req.user?.organizationId);
  }

  /**
   * Get account balance
   */
  @Get('account/:accountId/balance')
  async getBalance(
    @Param('accountId') accountId: string,
    @Request() req: any,
    @Query('asOfDate') asOfDate?: string,
  ) {
    const balance = asOfDate
      ? await this.glService.getBalance(accountId, new Date(asOfDate), req.user?.organizationId)
      : await this.glService.getCurrentBalance(accountId, req.user?.organizationId);

    return {
      accountId,
      balance,
      asOfDate: asOfDate || new Date(),
    };
  }

  /**
   * Get current balance
   */
  @Get('account/:accountId/current-balance')
  async getCurrentBalance(@Param('accountId') accountId: string, @Request() req: any) {
    return {
      accountId,
      currentBalance: await this.glService.getCurrentBalance(accountId, req.user?.organizationId),
    };
  }

  /**
   * Get trial balance
   */
  @Get('trial-balance')
  async getTrialBalance(@Query() query: TrialBalanceQueryDto, @Request() req: any) {
    return this.glService.getTrialBalance(req.user?.organizationId, query, req.user?.branchId);
  }

  /**
   * Get unreconciled entries
   */
  @Get('account/:accountId/unreconciled')
  async getUnreconciled(
    @Param('accountId') accountId: string,
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 100,
  ) {
    return this.glService.getUnreconciledEntries(accountId, req.user?.organizationId, page, limit);
  }

  /**
   * Reconcile entries
   */
  @Post('reconcile')
  @HttpCode(HttpStatus.OK)
  async reconcileEntries(@Body() body: { entryIds: string[] }) {
    await this.glService.reconcileEntries(body.entryIds);
    return { message: `${body.entryIds.length} entries reconciled successfully` };
  }

  /**
   * Get account totals by period
   */
  @Get('account/:accountId/period/:period/totals')
  async getAccountTotals(
    @Param('accountId') accountId: string,
    @Param('period') period: string,
    @Request() req: any,
  ) {
    return this.glService.getAccountTotalsByPeriod(accountId, period, req.user?.organizationId);
  }

  /**
   * Get entries by counterparty
   */
  @Get('counterparty/:counterpartyId')
  async getCounterpartyLedger(
    @Param('counterpartyId') counterpartyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 100,
    @Request() req: any,
  ) {
    return this.glService.getCounterpartyLedger(counterpartyId, req.user?.organizationId, page, limit);
  }

  /**
   * Get entries by reference
   */
  @Get('reference/:referenceNumber')
  async getEntriesByReference(
    @Param('referenceNumber') referenceNumber: string,
    @Request() req: any,
  ) {
    return this.glService.getEntriesByReference(referenceNumber, req.user?.organizationId);
  }

  /**
   * Generate GL Report
   */
  @Get('report/trial-balance')
  async generateGLReport(@Query() query: TrialBalanceQueryDto, @Request() req: any) {
    return this.glService.generateGLReport(req.user?.organizationId, query, req.user?.branchId);
  }

  /**
   * Get account history
   */
  @Get('account/:accountId/history')
  async getAccountHistory(
    @Param('accountId') accountId: string,
    @Request() req: any,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.glService.getAccountHistory(
      accountId,
      req.user?.organizationId,
      fromDate ? new Date(fromDate) : new Date(),
      toDate ? new Date(toDate) : new Date(),
    );
  }
}
