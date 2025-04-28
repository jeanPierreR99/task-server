import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Task } from './task.entity';
import { User } from './user.entity';
import { File } from './file.entity';
import { Activity } from './activity.entity';

@Entity()
export class Subtask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  completed: boolean;

  @Column('timestamp')
  dateCulmined: Date;

  @ManyToOne(() => Task, task => task.subtasks, { onDelete: 'CASCADE' })
  task: Task;

  @ManyToOne(() => User, user => user.subtasks)
  responsible: User;

  @OneToMany(() => Activity, activity => activity.subtask, { cascade: true, onDelete: 'CASCADE' })
  activities: Activity[];

  @OneToMany(() => File, file => file.subtask, { cascade: true, onDelete: 'CASCADE' })
  files: File[];
}
