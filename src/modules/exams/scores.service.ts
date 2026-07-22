import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score } from './entities/score.entity';
import { SubmitScoresDto } from './dto/submit-scores.dto';
import { ExamsService } from './exams.service';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { StudentsService } from '../students/students.service';

@Injectable()
export class ScoresService {
  constructor(
    @InjectRepository(Score)
    private readonly scoreRepo: Repository<Score>,
    private readonly examsService: ExamsService,
    private readonly studentsService: StudentsService,
  ) {}

  // Nhập điểm hàng loạt cho 1 bài kiểm tra (upsert: có rồi thì cập nhật, chưa có thì tạo mới)
  async submitScores(
    examId: string,
    dto: SubmitScoresDto,
    currentUser: AuthUser,
  ): Promise<Score[]> {
    const exam = await this.examsService.findOne(examId);
    await this.examsService.assertCanManageExam(exam, currentUser);
    // Lưu ý: gọi method private qua bracket-access chỉ để tái dùng logic phân quyền,
    // cách sạch hơn là đổi method đó thành public trong ExamsService - xem ghi chú bên dưới.

    const results: Score[] = [];

    for (const item of dto.scores) {
      await this.studentsService.findOne(item.studentId); // ném NotFound nếu sai id

      let score = await this.scoreRepo.findOne({
        where: { examId, studentId: item.studentId },
      });

      if (score) {
        score.score = item.score;
      } else {
        score = this.scoreRepo.create({
          examId,
          studentId: item.studentId,
          score: item.score,
        });
      }

      results.push(await this.scoreRepo.save(score));
    }

    return results;
  }

  // Xem toàn bộ điểm của 1 bài kiểm tra
  findByExam(examId: string): Promise<Score[]> {
    return this.scoreRepo.find({ where: { examId } });
  }

  // Xem toàn bộ điểm của 1 học sinh (dùng cho report + tự xem điểm)
  findByStudent(studentId: string): Promise<Score[]> {
    return this.scoreRepo.find({
      where: { studentId },
      relations: { exam: true },
    });
  }
}