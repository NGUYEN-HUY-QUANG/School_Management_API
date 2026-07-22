import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Toán' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'Môn Toán khối 10-12' })
  @IsOptional()
  @IsString()
  description?: string;
}