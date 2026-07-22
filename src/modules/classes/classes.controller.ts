import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AssignHomeroomTeacherDto } from './dto/assign-homeroom-teacher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/emuns/role.enum';

@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.classesService.update(id, dto);
  }

  @Patch(':id/homeroom-teacher')
  @Roles(Role.ADMIN)
  assignHomeroomTeacher(
    @Param('id') id: string,
    @Body() dto: AssignHomeroomTeacherDto,
  ) {
    return this.classesService.assignHomeroomTeacher(id, dto.teacherId);
  }

  @Delete(':id/homeroom-teacher')
  @Roles(Role.ADMIN)
  removeHomeroomTeacher(@Param('id') id: string) {
    return this.classesService.removeHomeroomTeacher(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }
}