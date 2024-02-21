import {
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductBodyDto {
  @IsString()
  @MaxLength(255, {
    message: 'product name cannot be longer than 255 characters',
  })
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;

  @IsDecimal(
    {},
    {
      message: 'Price must be a valid decimal number',
    },
  )
  @IsNotEmpty({
    message: 'Price is required',
  })
  @Transform(({ value }) => value.toString(), { toClassOnly: true })
  price: string;

  @IsInt({
    message: 'Quantity must be an integer',
  })
  @Min(0, {
    message: 'Quantity must be greater than or equal to 0',
  })
  @IsNotEmpty({
    message: 'Quantity is required',
  })
  quantity: number;
}
