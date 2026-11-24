import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// Shared validator stack for phone-number DTO fields: free-form string
// (international formats accepted, no strict pattern on purpose), trimmed,
// max 40 chars. Keeps the phone rules identical across every DTO that
// carries one instead of copy-pasting the stack.
export function IsPhoneField(options: { optional?: boolean } = {}) {
  return applyDecorators(
    ...(options.optional ? [IsOptional()] : []),
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string' ? value.trim() : value,
    ),
    IsString(),
    IsNotEmpty(),
    MaxLength(40),
  );
}
