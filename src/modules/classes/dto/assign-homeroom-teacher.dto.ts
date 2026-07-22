import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignHomeroomTeacherDto {
  @ApiProperty({ example: 'uuid-giao-vien' })
  @IsUUID()
  teacherId: string;
}