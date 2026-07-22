import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { TeachersService } from '../teachers/teachers.service';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,
    private readonly teachersService: TeachersService,
  ) {}

  async create(dto: CreateClassDto): Promise<Class> {
    const existedName = await this.classRepo.findOne({
      where: { name: dto.name },
    });
    if (existedName) throw new ConflictException('Tên lớp đã tồn tại');

    if (dto.homeroomTeacherId) {
      await this.teachersService.findOne(dto.homeroomTeacherId); // ném NotFound nếu sai id
      await this.assertTeacherAvailable(dto.homeroomTeacherId);
    }

    const newClass = this.classRepo.create({
      name: dto.name,
      description: dto.description,
      homeroomTeacherId: dto.homeroomTeacherId ?? null,
    });

    return this.classRepo.save(newClass);
  }

  findAll(): Promise<Class[]> {
    return this.classRepo.find();
  }

  async findOne(id: string): Promise<Class> {
    const found = await this.classRepo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy lớp học');
    return found;
  }

  async update(id: string, dto: UpdateClassDto): Promise<Class> {
    const cls = await this.findOne(id);

    if (dto.name && dto.name !== cls.name) {
      const existedName = await this.classRepo.findOne({
        where: { name: dto.name },
      });
      if (existedName) throw new ConflictException('Tên lớp đã tồn tại');
    }

    Object.assign(cls, dto);
    return this.classRepo.save(cls);
  }

  // API riêng: phân công / đổi giáo viên chủ nhiệm cho 1 lớp.
  // Đây là nơi DUY NHẤT được phép thay đổi homeroomTeacherId.
  async assignHomeroomTeacher(classId: string, teacherId: string): Promise<Class> {
    const cls = await this.findOne(classId);
    await this.teachersService.findOne(teacherId); // ném NotFound nếu sai id

    if (cls.homeroomTeacherId === teacherId) {
      return cls; // đã là chủ nhiệm sẵn, khỏi làm gì thêm
    }

    await this.assertTeacherAvailable(teacherId);

    cls.homeroomTeacherId = teacherId;
    return this.classRepo.save(cls);
  }

  // Gỡ chủ nhiệm khỏi lớp (đưa lớp về trạng thái chưa có chủ nhiệm)
  async removeHomeroomTeacher(classId: string): Promise<Class> {
    const cls = await this.findOne(classId);
    cls.homeroomTeacherId = null;
    return this.classRepo.save(cls);
  }

  async remove(id: string): Promise<void> {
    const cls = await this.findOne(id);
    await this.classRepo.remove(cls);
  }

  // Đảm bảo nghiệp vụ: giáo viên này hiện chưa chủ nhiệm bất kỳ lớp nào khác
  private async assertTeacherAvailable(teacherId: string): Promise<void> {
    const existingClass = await this.classRepo.findOne({
      where: { homeroomTeacherId: teacherId },
    });

    if (existingClass) {
      throw new BadRequestException(
        `Giáo viên này đang chủ nhiệm lớp "${existingClass.name}", không thể phân công thêm`,
      );
    }
  }
}