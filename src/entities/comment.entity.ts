import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Task } from './task.entity';
import { User } from './user.entity';
import { File } from './file.entity';
import { Activity } from './activity.entity';

@Entity()
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    comment: string;

    @Column()
    date: Date;

    @ManyToOne(() => Task, task => task.comments, { onDelete: 'CASCADE' })
    task: Task;

    @ManyToOne(() => User, user => user.comments)
    user: User;

    @OneToMany(() => File, file => file.comment, { cascade: true, onDelete: 'CASCADE', nullable: true })
    files: File[];

    @OneToMany(() => Activity, activity => activity.comment, { cascade: true, onDelete: 'CASCADE', nullable: true })
    activities: File[];
}
