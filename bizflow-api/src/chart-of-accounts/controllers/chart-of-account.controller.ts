import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChartOfAccountService } from '../services/chart-of-account.service';
import {
  CreateChartOfAccountDto,
  UpdateChartOfAccountDto,
  ChartOfAccountQueryDto,
} from '../dto/chart-of-account.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('accounting/chart-of-accounts')
export class ChartOfAccountController {
  constructor(private readonly coaService: ChartOfAccountService) {}

  /**
   * Create new Chart of Account
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateChartOfAccountDto, @Request() req: any) {
    return this.coaService.createAccount(
      createDto,
      req.user?.id,
      req.user?.organizationId,
    );
  }

  /**
   * Get all accounts with filtering
   */
  @Get()
  async getAll(@Query() query: ChartOfAccountQueryDto, @Request() req: any) {
    return this.coaService.getAccounts(
      req.user?.organizationId,
      query,
      req.user?.branchId,
    );
  }

  /**
   * Get account by ID
   */
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.coaService.getById(id);
  }

  /**
   * Get account by code
   */
  @Get('code/:code')
  async getByCode(@Param('code') code: string, @Request() req: any) {
    return this.coaService.getAccountByCode(code, req.user?.organizationId);
  }

  /**
   * Get account balance
   */
  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    return {
      balance: await this.coaService.getAccountBalance(id),
    };
  }

  /**
   * Get accounts by type
   */
  @Get('type/:type')
  async getByType(@Param('type') type: number, @Query('page') page = 1, @Query('limit') limit = 50, @Request() req: any) {
    return this.coaService.getAccountsByType(
      type,
      req.user?.organizationId,
      req.user?.branchId,
      page,
      limit,
    );
  }

  /**
   * Get active posting accounts
   */
  @Get('active/list')
  async getActiveAccounts(@Request() req: any) {
    return this.coaService.getActiveAccounts(req.user?.organizationId, req.user?.branchId);
  }

  /**
   * Get header accounts
   */
  @Get('headers/list')
  async getHeaderAccounts(@Request() req: any) {
    return this.coaService.getHeaderAccounts(req.user?.organizationId);
  }

  /**
   * Seed default Chart of Accounts with accounting standards
   * This endpoint seeds a complete Chart of Accounts following international accounting standards
   * Including Assets, Liabilities, Equity, Revenue, and Expenses with proper account codes
   */
  @Post('seed')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async seedAccounts(@Request() req: any) {
    return this.coaService.seedChartOfAccounts(
      req.user?.organizationId,
      req.user?.branchId,
    );
  }

  /**
   * Update Chart of Account
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateChartOfAccountDto,
    @Request() req: any,
  ) {
    return this.coaService.updateAccount(id, updateDto, req.user?.id);
  }

  /**
   * Deactivate account
   */
  @Put(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id') id: string) {
    await this.coaService.deactivateAccount(id);
    return { message: 'Account deactivated successfully' };
  }

  /**
   * Delete account
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @Request() req: any) {
    await this.coaService.deleteAccount(id, req.user?.id);
    return { message: 'Account deleted successfully' };
  }
}
