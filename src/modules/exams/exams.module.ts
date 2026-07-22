import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from './entities/exam.entity';
import { Score } from './entities/score.entity';
import { ExamsService } from './exams.service';
import { ScoresService } from './scores.service';
import { ExamsController } from './exams.controller';
import { ScoresController } from './scores.controller';
import { SubjectsModule } from '../subject/subjects.module';
import { ClassesModule } from '../classes/classes.module';
import { TeachersModule } from '../teachers/teachers.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exam, Score]),
    SubjectsModule,
    ClassesModule,
    TeachersModule,
    StudentsModule,
  ],
  controllers: [ExamsController, ScoresController],
  providers: [ExamsService, ScoresService],
  exports: [ExamsService, ScoresService, TypeOrmModule], // export cho Reports module sau này
})
export class ExamsModule {}