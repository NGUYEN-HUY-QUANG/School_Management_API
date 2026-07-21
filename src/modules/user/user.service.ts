import * as bcrypt from 'bcrypt';
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
        where: {
        username: dto.username,
        },
    });

    if (existingUser) {
        throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
        ...dto,
        password: hashedPassword,
    });

        const savedUser = await this.userRepository.save(user);

        const { password, ...result } = savedUser;

        return result;
    }
    async findByUsername(username: string) {
        return this.userRepository.findOne({
            where: {
            username,
            },
        });
    }
}