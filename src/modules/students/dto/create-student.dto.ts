import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateStudentDto {
  // --- thông tin tài khoản (User) ---
  @ApiProperty({ example: 'student01@school.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Tran Thi B' })
  @IsString()
  fullName: string;

  // --- thông tin nghiệp vụ (Student) ---
  @ApiProperty({ example: 'uuid-lop-10a1', description: 'Id lớp học sinh thuộc về' })
  @IsUUID()
  classId: string;

  @ApiPropertyOptional({ example: '0912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '45 Nguyen Trai, Q5, TP.HCM' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '2009-05-20' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}