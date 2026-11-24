import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsPhoneField } from '../../../decorators/is-phone-field.decorator';

const trim = Transform(({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value,
);

export class RegisterDto {
  @trim
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @trim
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  firstName: string;

  @trim
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  lastName: string;

  @IsPhoneField({ optional: true })
  phone?: string;
}
