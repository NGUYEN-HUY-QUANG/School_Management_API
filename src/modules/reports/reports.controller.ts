import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/emuns/role.enum';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.TEACHER)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('teachers-with-homeroom')
  teachersWithHomeroom() {
    return this.reportsService.teachersWithHomeroom();
  }

  @Get('teachers-without-homeroom')
  teachersWithoutHomeroom() {
    return this.reportsService.teachersWithoutHomeroom();
  }

  @Get('student-averages')
  studentAverages() {
    return this.reportsService.studentAverages();
  }

  @Get('top-students')
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  topStudents(@Query('limit') limit?: string) {
    return this.reportsService.topStudents(limit ? parseInt(limit, 10) : 10);
  }

  @Get('failing-students/:subjectId')
  @ApiQuery({ name: 'threshold', required: false, example: 5.0 })
  failingStudents(
    @Param('subjectId') subjectId: string,
    @Query('threshold') threshold?: string,
  ) {
    return this.reportsService.failingStudents(
      subjectId,
      threshold ? parseFloat(threshold) : 5.0,
    );
  }
}