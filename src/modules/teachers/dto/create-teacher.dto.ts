import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateTeacherDto {
  // --- thông tin tài khoản (User) ---
  @ApiProperty({ example: 'teacher01@school.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  fullName: string;

  // --- thông tin nghiệp vụ (Teacher) ---
  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '123 Le Loi, Q1, TP.HCM' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '2020-09-01' })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Danh sách id môn học mà giáo viên này dạy',
    example: ['uuid-mon-toan', 'uuid-mon-ly'],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  subjectIds?: string[];
}