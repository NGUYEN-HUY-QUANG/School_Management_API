import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateClassDto {
  @ApiProperty({
    example: '10A1',
    description: 'Class name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  @ApiProperty({
    example: 10,
    description: 'Grade',
  })
  @IsInt()
  @Min(10)
  @Max(12)
  grade: number;

  @ApiProperty({
    example: '2026-2027',
    description: 'Academic year',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  academicYear: string;
}