import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  email?: string;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  email?: string;
}