import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto';

// Không cho sửa email/password qua đây (dành API riêng cho auth sau này)
export class UpdateTeacherDto extends PartialType(
  OmitType(CreateTeacherDto, ['email', 'password'] as const),
) {}