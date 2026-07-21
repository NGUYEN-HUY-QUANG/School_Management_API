import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Class } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async create(dto: CreateClassDto) {
    const existingClass = await this.classRepository.findOne({
      where: {
        name: dto.name,
      },
    });

    if (existingClass) {
      throw new ConflictException('Class already exists');
    }

    const classroom = this.classRepository.create(dto);

    return this.classRepository.save(classroom);
  }

  async findAll() {
    return this.classRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }
}