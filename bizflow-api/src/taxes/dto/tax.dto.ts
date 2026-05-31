import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateTaxDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;
}

export class UpdateTaxDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;
}