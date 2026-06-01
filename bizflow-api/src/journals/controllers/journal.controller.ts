import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JournalService } from '../services/journal.service';
import {
  CreateJournalDto,
  UpdateJournalDto,
  PostJournalDto,
  JournalQueryDto,
} from '../dto/journal.dto';

@Controller('accounting/journals')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  /**
   * Create new journal entry
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateJournalDto, @Request() req: any) {
    return this.journalService.createJournal(
      createDto,
      req.user?.id,
      req.user?.organizationId,
    );
  }

  /**
   * Get all journals with filtering
   */
  @Get()
  async getAll(@Query() query: JournalQueryDto, @Request() req: any) {
    return this.journalService.getJournals(
      req.user?.organizationId,
      query,
      req.user?.branchId,
    );
  }

  /**
   * Get journal by ID
   */
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.journalService.getById(id);
  }

  /**
   * Get draft journals for user
   */
  @Get('drafts/list')
  async getDrafts(@Request() req: any) {
    return this.journalService.getJournals(
      req.user?.organizationId,
      { status: 'DRAFT' } as JournalQueryDto,
      req.user?.branchId,
    );
  }

  /**
   * Get posted journals by period
   */
  @Get('period/:period')
  async getByPeriod(
    @Param('period') period: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Request() req: any,
  ) {
    return this.journalService.getJournals(
      req.user?.organizationId,
      { period, page, limit } as JournalQueryDto,
      req.user?.branchId,
    );
  }

  /**
   * Update journal entry (only if DRAFT)
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateJournalDto,
    @Request() req: any,
  ) {
    return this.journalService.updateJournal(id, updateDto, req.user?.id);
  }

  /**
   * Post journal to General Ledger
   */
  @Post(':id/post')
  @HttpCode(HttpStatus.OK)
  async postJournal(@Param('id') id: string, @Request() req: any) {
    return this.journalService.postJournal(id, req.user?.id);
  }

  /**
   * Reverse journal entry
   */
  @Post(':id/reverse')
  @HttpCode(HttpStatus.OK)
  async reverseJournal(@Param('id') id: string, @Request() req: any) {
    return this.journalService.reverseJournal(id, req.user?.id);
  }

  /**
   * Delete journal entry (only if DRAFT)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @Request() req: any) {
    await this.journalService.delete(id, req.user?.id);
    return { message: 'Journal entry deleted successfully' };
  }

  /**
   * Bulk post multiple journals
   */
  @Post('bulk/post')
  @HttpCode(HttpStatus.OK)
  async bulkPost(@Body() body: { journalIds: string[] }, @Request() req: any) {
    const results = [];
    for (const journalId of body.journalIds) {
      try {
        const result = await this.journalService.postJournal(journalId, req.user?.id);
        results.push({ journalId, status: 'success', data: result });
      } catch (error) {
        results.push({ journalId, status: 'error', message: error.message });
      }
    }
    return { results };
  }
}
