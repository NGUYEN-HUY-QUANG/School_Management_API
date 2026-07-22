import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';

// Không cho sửa email/password qua đây;
// đổi lớp cũng tách API riêng (transfer) cho rõ nghiệp vụ, không gộp vào update chung
export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, ['email', 'password', 'classId'] as const),
) {}