import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { TransferClassDto } from './dto/transfer-class.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/emuns/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  findAll() {
    return this.studentsService.findAll();
  }

  // Đặt route cụ thể (search, class/:classId) TRƯỚC route động (:id)
  // để tránh Nest hiểu nhầm "search" hay "class" là 1 giá trị :id
  @Get('search')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiQuery({ name: 'keyword', required: true, example: 'Tran' })
  search(@Query('keyword') keyword: string) {
    return this.studentsService.search(keyword);
  }

  @Get('class/:classId')
  @Roles(Role.ADMIN, Role.TEACHER)
  findByClass(@Param('classId') classId: string) {
    return this.studentsService.findByClass(classId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const student = await this.studentsService.findOne(id);

    // STUDENT chỉ được xem hồ sơ của chính mình, không được xem của người khác
    if (user.role === 'student' && student.userId !== user.id) {
        throw new ForbiddenException('Bạn không có quyền xem hồ sơ này');
    }

    return student;
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Patch(':id/transfer-class')
  @Roles(Role.ADMIN)
  transferClass(@Param('id') id: string, @Body() dto: TransferClassDto) {
    return this.studentsService.transferClass(id, dto.classId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}