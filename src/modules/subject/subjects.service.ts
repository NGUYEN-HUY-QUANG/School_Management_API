import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository , In} from 'typeorm';
import { Subject } from './entities/subject.etity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
  ) {}

  async create(dto: CreateSubjectDto): Promise<Subject> {
    const existed = await this.subjectRepo.findOne({
      where: { name: dto.name },
    });
    if (existed) throw new ConflictException('Môn học đã tồn tại');

    const subject = this.subjectRepo.create(dto);
    return this.subjectRepo.save(subject);
  }

  findAll(): Promise<Subject[]> {
    return this.subjectRepo.find();
  }

  async findOne(id: string): Promise<Subject> {
    const subject = await this.subjectRepo.findOne({ where: { id } });
    if (!subject) throw new NotFoundException('Không tìm thấy môn học');
    return subject;
  }

  async findByIds(ids: string[]): Promise<Subject[]> {
    if (!ids || ids.length === 0) return [];
    const subjects = await this.subjectRepo.find({ where: { id: In(ids) } });
    if (subjects.length !== ids.length) {
        throw new NotFoundException('Có subjectId không tồn tại');
    }
    return subjects;
  }

  async update(id: string, dto: UpdateSubjectDto): Promise<Subject> {
    const subject = await this.findOne(id);
    Object.assign(subject, dto);
    return this.subjectRepo.save(subject);
  }

  async remove(id: string): Promise<void> {
    const subject = await this.findOne(id);
    await this.subjectRepo.remove(subject);
  }
}