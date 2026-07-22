import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Subject } from '../../subject/entities/subject.etity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Mỗi Teacher gắn với đúng 1 User (tài khoản đăng nhập)
  @OneToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ name: 'hire_date', type: 'date', nullable: true })
  hireDate: string;

  // Chủ sở hữu quan hệ N-N, TypeORM sẽ tạo bảng trung gian teacher_subjects
  @ManyToMany(() => Subject, (subject) => subject.teachers)
  @JoinTable({
    name: 'teacher_subjects',
    joinColumn: { name: 'teacher_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
  })
  subjects: Subject[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}