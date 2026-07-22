import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class StudentScoreDto {
  @ApiProperty({ example: 'uuid-hoc-sinh' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ example: 8.5 })
  @IsNumber()
  @Min(0)
  @Max(10)
  score: number;
}

export class SubmitScoresDto {
  @ApiProperty({ type: [StudentScoreDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StudentScoreDto)
  scores: StudentScoreDto[];
}