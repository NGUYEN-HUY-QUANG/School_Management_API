import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UsersService } from '../user/user.service';
import { ClassesService } from '../classes/classes.service';
import { Role } from '../../common/emuns/role.enum';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly classesService: ClassesService,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    // Kiểm tra lớp tồn tại trước khi mở transaction, để fail sớm không cần rollback
    await this.classesService.findOne(dto.classId);

    return this.dataSource.transaction(async (manager) => {
      const user = await this.usersService.create({
        email: dto.email,
        password: dto.password,
        fullName: dto.fullName,
        role: Role.STUDENT,
      });

      const student = manager.create(Student, {
        userId: user.id,
        classId: dto.classId,
        phone: dto.phone,
        address: dto.address,
        dateOfBirth: dto.dateOfBirth,
      });

      return manager.save(Student, student);
    });
  }

  findAll(): Promise<Student[]> {
    return this.studentRepo.find();
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepo.findOne({ where: { id } });
    if (!student) throw new NotFoundException('Không tìm thấy học sinh');
    return student;
  }

  // Xem danh sách học sinh của một lớp (yêu cầu bắt buộc trong đề bài)
  async findByClass(classId: string): Promise<Student[]> {
    await this.classesService.findOne(classId); // ném NotFound nếu classId sai
    return this.studentRepo.find({ where: { classId } });
  }

  // Tìm kiếm học sinh theo tên (yêu cầu bắt buộc trong đề bài)
  async search(keyword: string): Promise<Student[]> {
    return this.studentRepo.find({
      where: [
        { user: { fullName: ILike(`%${keyword}%`) } },
        { user: { email: ILike(`%${keyword}%`) } },
      ],
    });
  }

  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    Object.assign(student, dto);
    return this.studentRepo.save(student);
  }

  // Chuyển lớp cho học sinh - tách riêng khỏi update() cho rõ nghiệp vụ
  async transferClass(id: string, classId: string): Promise<Student> {
    const student = await this.findOne(id);
    await this.classesService.findOne(classId); // ném NotFound nếu sai id

    student.classId = classId;
    return this.studentRepo.save(student);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepo.remove(student);
  }
}