import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateExamDto {
  @ApiProperty({ example: 'Kiểm tra 15 phút chương 1' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: 'uuid-mon-toan' })
  @IsUUID()
  subjectId: string;

  @ApiProperty({ example: 'uuid-lop-10a1' })
  @IsUUID()
  classId: string;

  @ApiPropertyOptional({ example: '2026-08-15' })
  @IsOptional()
  @IsDateString()
  examDate?: string;

  @ApiPropertyOptional({
    description: 'Chỉ ADMIN mới cần truyền (chỉ định giáo viên phụ trách). Giáo viên tự tạo thì bỏ qua field này.',
    example: 'uuid-giao-vien',
  })
  @IsOptional()
  @IsUUID()
  teacherId?: string;
}