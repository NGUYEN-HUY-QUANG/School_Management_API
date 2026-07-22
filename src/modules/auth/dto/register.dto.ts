import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from '../../user/dto/create-user.dto';

// Đăng ký công khai: không cho tự chọn role admin/teacher,
// mặc định luôn tạo STUDENT (role admin/teacher do ADMIN tạo qua UsersController)
export class RegisterDto extends PickType(CreateUserDto, [
  'email',
  'password',
  'fullName',
] as const) {}