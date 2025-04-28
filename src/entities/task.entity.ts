import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Subtask } from './subtask.entity';
import { Comment } from './comment.entity';
import { File } from './file.entity';
import { Activity } from './activity.entity';

@Entity()
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    completed: boolean;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    created_by: User;

    @Column()
    status: string;

    @Column('timestamp')
    dateCulmined: Date;

    @ManyToOne(() => User, user => user.tasks)
    responsible: User;

    @ManyToOne(() => Category, category => category.tasks)
    category: Category;

    @OneToMany(() => Subtask, subtask => subtask.task, { cascade: true, onDelete: 'CASCADE' })
    subtasks: Subtask[];

    @OneToMany(() => Activity, activity => activity.task, { cascade: true, onDelete: 'CASCADE' })
    activities: Activity[];

    @OneToMany(() => Comment, comment => comment.task, { cascade: true, onDelete: 'CASCADE' })
    comments: Comment[];

    @OneToMany(() => File, file => file.task, { cascade: true, onDelete: 'CASCADE' })
    files: File[];
}
