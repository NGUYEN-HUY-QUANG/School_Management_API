import { Body, Controller, Get, Param, Post, UseGuards , ForbiddenException} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ScoresService } from './scores.service';
import { SubmitScoresDto } from './dto/submit-scores.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/emuns/role.enum';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { StudentsService } from '../students/students.service';

@ApiTags('Scores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ScoresController {
  constructor(
    private readonly scoresService: ScoresService,
    private readonly studentsService: StudentsService,
) {}

  // Nhập điểm hàng loạt cho 1 bài kiểm tra
  @Post('exams/:examId/scores')
  @Roles(Role.ADMIN, Role.TEACHER)
  submitScores(
    @Param('examId') examId: string,
    @Body() dto: SubmitScoresDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.scoresService.submitScores(examId, dto, user);
  }

  // Xem toàn bộ điểm của 1 bài kiểm tra (giáo viên/admin chấm xong xem lại)
  @Get('exams/:examId/scores')
  @Roles(Role.ADMIN, Role.TEACHER)
  findByExam(@Param('examId') examId: string) {
    return this.scoresService.findByExam(examId);
  }

  @Get('students/:studentId/scores')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async findByStudent(
    @Param('studentId') studentId: string,
    @CurrentUser() user: AuthUser,
    ) {
    if (user.role === Role.STUDENT) {
        const student = await this.studentsService.findByUserId(user.id);
        if (!student || student.id !== studentId) {
        throw new ForbiddenException('Bạn không có quyền xem điểm này');
        }
    }
    return this.scoresService.findByStudent(studentId);
  }
}