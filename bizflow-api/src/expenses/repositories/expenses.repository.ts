import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Expense, ExpenseDocument } from '../schemas/expense.schema';

@Injectable()
export class ExpensesRepository extends BaseRepository<ExpenseDocument> {
  constructor(
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<ExpenseDocument>,
  ) {
    super(expenseModel);
  }

  async findByOrganization(organizationId: string, page = 1, limit = 20) {
    const orgId = new Types.ObjectId(organizationId);
    return this.findAllPaginated({ organizationId: orgId }, page, limit);
  }
}
