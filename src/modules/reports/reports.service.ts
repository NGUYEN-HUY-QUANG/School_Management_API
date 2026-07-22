import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Class } from '../classes/entities/class.entity';
import { Student } from '../students/entities/student.entity';
import { Score } from '../exams/entities/score.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Score)
    private readonly scoreRepo: Repository<Score>,
  ) {}

  // Báo cáo: Danh sách giáo viên đang chủ nhiệm lớp
  async teachersWithHomeroom(): Promise<
    { teacherId: string; fullName: string; className: string }[]
  > {
    const classes = await this.classRepo.find({
      where: { homeroomTeacherId: Not(IsNull()) },
      relations: { homeroomTeacher: { user: true } },
    });

    return classes.map((c) => ({
      teacherId: c.homeroomTeacher!.id,
      fullName: c.homeroomTeacher!.user.fullName,
      className: c.name,
    }));
  }

  // Báo cáo: Danh sách giáo viên chưa được phân công lớp
  async teachersWithoutHomeroom(): Promise<Teacher[]> {
    const classes = await this.classRepo.find();

    const assignedTeacherIds = classes
      .map((c) => c.homeroomTeacherId)
      .filter((id): id is string => id !== null);

    const allTeachers = await this.teacherRepo.find();

    return allTeachers.filter((t) => !assignedTeacherIds.includes(t.id));
  }

  // Báo cáo: Điểm trung bình của từng học sinh (tất cả bài kiểm tra, mọi môn)
  async studentAverages(): Promise<
    {
      studentId: string;
      fullName: string;
      className: string;
      averageScore: number;
    }[]
  > {
    const raw = await this.scoreRepo
      .createQueryBuilder('score')
      .innerJoin('score.student', 'student')
      .innerJoin('student.user', 'user')
      .innerJoin('student.class', 'class')
      .select('student.id', 'studentId')
      .addSelect('user.fullName', 'fullName')
      .addSelect('class.name', 'className')
      .addSelect('AVG(score.score)', 'averageScore')
      .groupBy('student.id')
      .addGroupBy('user.fullName')
      .addGroupBy('class.name')
      .getRawMany();

    return raw.map((r) => ({
      studentId: r.studentId,
      fullName: r.fullName,
      className: r.className,
      averageScore: parseFloat(parseFloat(r.averageScore).toFixed(2)),
    }));
  }

  // Báo cáo: Top học sinh điểm trung bình cao nhất
  async topStudents(limit = 10) {
    const averages = await this.studentAverages();

    return averages
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, limit);
  }

  // Báo cáo: Danh sách học sinh trượt môn (điểm TB môn < threshold)
  async failingStudents(subjectId: string, threshold = 5.0) {
    const raw = await this.scoreRepo
      .createQueryBuilder('score')
      .innerJoin('score.exam', 'exam')
      .innerJoin('score.student', 'student')
      .innerJoin('student.user', 'user')
      .innerJoin('student.class', 'class')
      .where('exam.subjectId = :subjectId', { subjectId })
      .select('student.id', 'studentId')
      .addSelect('user.fullName', 'fullName')
      .addSelect('class.name', 'className')
      .addSelect('AVG(score.score)', 'averageScore')
      .groupBy('student.id')
      .addGroupBy('user.fullName')
      .addGroupBy('class.name')
      .having('AVG(score.score) < :threshold', { threshold })
      .getRawMany();

    return raw.map((r) => ({
      studentId: r.studentId,
      fullName: r.fullName,
      className: r.className,
      averageScore: parseFloat(parseFloat(r.averageScore).toFixed(2)),
    }));
  }
}