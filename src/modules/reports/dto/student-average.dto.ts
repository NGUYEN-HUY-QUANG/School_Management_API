import { ApiProperty } from '@nestjs/swagger';

export class StudentAverageDto {
  @ApiProperty() studentId: string;
  @ApiProperty() fullName: string;
  @ApiProperty() className: string;
  @ApiProperty() averageScore: number;
}