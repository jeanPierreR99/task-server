import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Task } from './task.entity';
import { Subtask } from './subtask.entity';
import { Comment } from './comment.entity';
import { Activity } from './activity.entity';

@Entity()
export class File {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    reference: string;

    @Column({ default: false, nullable: true })
    inFolder: boolean;

    @Column({ nullable: true })
    nameFolder: string;


    @Column({ type: 'timestamp', precision: 3 })
    uploaded_in: Date;

    @Column()
    url: string;

    @ManyToOne(() => Comment, comment => comment.files, { nullable: true, onDelete: 'CASCADE' })
    comment: Comment;

    @ManyToOne(() => Task, task => task.files, { nullable: true, onDelete: 'CASCADE' })
    task: Task;

    @ManyToOne(() => Subtask, subtask => subtask.files, { nullable: true, onDelete: 'CASCADE' })
    subtask: Subtask;

    @ManyToOne(() => Activity, activity => activity.files, { nullable: true, onDelete: 'CASCADE' }) // 🔥 Esta es la correcta
    activity: Activity;
}
