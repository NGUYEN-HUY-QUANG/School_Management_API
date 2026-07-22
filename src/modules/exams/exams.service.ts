import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from './entities/exam.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { SubjectsService } from '../subject/subjects.service';
import { ClassesService } from '../classes/classes.service';
import { TeachersService } from '../teachers/teachers.service';
import { Role } from '../../common/emuns/role.enum';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private readonly examRepo: Repository<Exam>,
    private readonly subjectsService: SubjectsService,
    private readonly classesService: ClassesService,
    private readonly teachersService: TeachersService,
  ) {}

  async create(dto: CreateExamDto, currentUser: AuthUser): Promise<Exam> {
    await this.subjectsService.findOne(dto.subjectId); // ném NotFound nếu sai
    await this.classesService.findOne(dto.classId);

    const teacherId = await this.resolveTeacherId(dto.teacherId, currentUser);
    const teacher = await this.teachersService.findOne(teacherId);

    // Chỉ cho tạo bài kiểm tra thuộc môn mà giáo viên đó có dạy
    const teachesThisSubject = teacher.subjects?.some((s) => s.id === dto.subjectId);
    if (!teachesThisSubject) {
      throw new BadRequestException('Giáo viên này không phụ trách môn học đã chọn');
    }

    const exam = this.examRepo.create({
      title: dto.title,
      examDate: dto.examDate,
      subjectId: dto.subjectId,
      classId: dto.classId,
      teacherId,
    });

    return this.examRepo.save(exam);
  }

  findAll(): Promise<Exam[]> {
    return this.examRepo.find();
  }

  async findOne(id: string): Promise<Exam> {
    const exam = await this.examRepo.findOne({ where: { id } });
    if (!exam) throw new NotFoundException('Không tìm thấy bài kiểm tra');
    return exam;
  }

  findByClass(classId: string): Promise<Exam[]> {
    return this.examRepo.find({ where: { classId } });
  }

  async update(id: string, dto: UpdateExamDto, currentUser: AuthUser): Promise<Exam> {
    const exam = await this.findOne(id);
    await this.assertCanManageExam(exam, currentUser);

    if (dto.subjectId) await this.subjectsService.findOne(dto.subjectId);
    if (dto.classId) await this.classesService.findOne(dto.classId);

    Object.assign(exam, dto);
    return this.examRepo.save(exam);
  }

  async remove(id: string, currentUser: AuthUser): Promise<void> {
    const exam = await this.findOne(id);
    await this.assertCanManageExam(exam, currentUser);
    await this.examRepo.remove(exam);
  }

  // Xác định teacherId sẽ gắn cho Exam:
  // - ADMIN: bắt buộc truyền teacherId trong dto
  // - TEACHER: luôn dùng chính hồ sơ giáo viên của họ, bỏ qua teacherId trong dto (tránh mạo danh)
  private async resolveTeacherId(
    dtoTeacherId: string | undefined,
    currentUser: AuthUser,
  ): Promise<string> {
    if (currentUser.role === Role.ADMIN) {
      if (!dtoTeacherId) {
        throw new BadRequestException('ADMIN phải chỉ định teacherId khi tạo bài kiểm tra');
      }
      return dtoTeacherId;
    }

    // role TEACHER
    const teacher = await this.teachersService.findByUserId(currentUser.id);
    if (!teacher) {
      throw new ForbiddenException('Tài khoản này chưa gắn với hồ sơ giáo viên nào');
    }
    return teacher.id;
  }

  // ADMIN được sửa/xóa mọi Exam; TEACHER chỉ được thao tác Exam do chính mình tạo
    async assertCanManageExam(exam: Exam, currentUser: AuthUser): Promise<void> {
    if (currentUser.role === Role.ADMIN) return;

    const teacher = await this.teachersService.findByUserId(currentUser.id);
    if (!teacher || teacher.id !== exam.teacherId) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên bài kiểm tra này');
    }
  }
}