import {
  IsArray,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { SortDirection } from '../../../common/types/general.type';

export class GetProductsParamDto {
  @IsString()
  @IsOptional()
  search: string;

  @IsOptional()
  @IsArray()
  @IsNumberString({}, { each: true })
  createdBy: number[];

  @IsString()
  @IsOptional()
  sort: string;

  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection;
}
