import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateClassDto } from './create-class.dto';

// Không cho đổi chủ nhiệm qua update() chung chung,
// bắt buộc dùng API riêng assign-homeroom-teacher cho rõ nghiệp vụ
export class UpdateClassDto extends PartialType(
  OmitType(CreateClassDto, ['homeroomTeacherId'] as const),
) {}