import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';
import { Subtask } from './subtask.entity';
import { File } from './file.entity';
import { Comment } from './comment.entity';

@Entity()
export class Activity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    action: string;

    @Column('timestamp')
    createdAt: Date;

    @ManyToOne(() => User, user => user.activities)
    user: User;

    @ManyToOne(() => Task, task => task.activities, { nullable: true, onDelete: 'CASCADE' })
    task: Task;

    @ManyToOne(() => Subtask, subtask => subtask.activities, { nullable: true, onDelete: 'CASCADE' })
    subtask: Subtask;

    @OneToMany(() => File, file => file.activity, { cascade: true })
    files: File[];

    @ManyToOne(() => Comment, comment => comment.activities, { nullable: true, onDelete: 'CASCADE' })
    comment: Comment;
}
