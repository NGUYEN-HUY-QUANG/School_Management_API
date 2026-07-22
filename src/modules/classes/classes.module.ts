import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './entities/class.entity';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { TeachersModule } from '../teachers/teachers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Class]), TeachersModule],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService, TypeOrmModule],
})
export class ClassesModule {}