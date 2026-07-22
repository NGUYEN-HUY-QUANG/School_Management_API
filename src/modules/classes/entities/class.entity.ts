import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // vd: "10A1", "11B2"

  @Column({ nullable: true })
  description: string;

  // Quan hệ 1-1 với Teacher: unique trên FK đảm bảo 1 giáo viên
  // không thể xuất hiện ở 2 dòng homeroom_teacher_id khác nhau.
  @ManyToOne(() => Teacher, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'homeroom_teacher_id' })
  homeroomTeacher: Teacher | null;

  @Column({ name: 'homeroom_teacher_id', nullable: true, unique: true })
  homeroomTeacherId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}