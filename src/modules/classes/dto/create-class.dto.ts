import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: '10A1' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'Lớp chuyên Toán khối 10' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Id giáo viên chủ nhiệm (có thể để trống, phân công sau)',
    example: 'uuid-giao-vien',
  })
  @IsOptional()
  @IsUUID()
  homeroomTeacherId?: string;
}