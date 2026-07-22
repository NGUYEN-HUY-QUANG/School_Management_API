import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { UsersService } from '../user/user.service';
import { SubjectsService } from '../subject/subjects.service';
import { Role } from '../../common/emuns/role.enum';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService,
  ) {}

  async create(dto: CreateTeacherDto): Promise<Teacher> {
    // Tạo User + Teacher trong cùng 1 transaction:
    // nếu bước nào lỗi thì rollback hết, tránh tạo ra User "mồ côi" không có Teacher.
    return this.dataSource.transaction(async (manager) => {
      const user = await this.usersService.create({
        email: dto.email,
        password: dto.password,
        fullName: dto.fullName,
        role: Role.TEACHER,
      });

      const subjects = dto.subjectIds
        ? await this.subjectsService.findByIds(dto.subjectIds)
        : [];

      const teacher = manager.create(Teacher, {
        userId: user.id,
        phone: dto.phone,
        address: dto.address,
        hireDate: dto.hireDate,
        subjects,
      });

      return manager.save(Teacher, teacher);
    });
  }

  findAll(): Promise<Teacher[]> {
    return this.teacherRepo.find({ relations: { subjects: true } });
  }

  async findOne(id: string): Promise<Teacher> {
    const teacher = await this.teacherRepo.findOne({
      where: { id },
      relations: { subjects: true },
    });
    if (!teacher) throw new NotFoundException('Không tìm thấy giáo viên');
    return teacher;
  }

  async findByUserId(userId: string): Promise<Teacher | null> {
    return this.teacherRepo.findOne({
        where: { userId },
        relations: { subjects: true },
    });
  }

  async update(id: string, dto: UpdateTeacherDto): Promise<Teacher> {
    const teacher = await this.findOne(id);

    if (dto.subjectIds) {
      teacher.subjects = await this.subjectsService.findByIds(dto.subjectIds);
    }

    teacher.phone = dto.phone ?? teacher.phone;
    teacher.address = dto.address ?? teacher.address;
    teacher.hireDate = dto.hireDate ?? teacher.hireDate;

    return this.teacherRepo.save(teacher);
  }

  async remove(id: string): Promise<void> {
    const teacher = await this.findOne(id);
    // onDelete: 'CASCADE' ở FK user_id lo phần xóa Teacher khi User bị xóa,
    // nhưng ở đây ta xóa Teacher trước, User vẫn còn (tùy nghiệp vụ, có thể khóa tài khoản thay vì xóa)
    await this.teacherRepo.remove(teacher);
  }
}