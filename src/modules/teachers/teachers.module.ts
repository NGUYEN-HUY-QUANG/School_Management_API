import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { UsersModule } from '../user/user.module';
import { SubjectsModule } from '../subject/subjects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher]),
    UsersModule,
    SubjectsModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService, TypeOrmModule], // export để Class module dùng (chủ nhiệm) sau này
})
export class TeachersModule {}