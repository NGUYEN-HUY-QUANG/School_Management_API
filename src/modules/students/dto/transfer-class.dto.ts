import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TransferClassDto {
  @ApiProperty({ example: 'uuid-lop-moi' })
  @IsUUID()
  classId: string;
}