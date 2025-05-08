import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Task } from './task.entity';
import { Subtask } from './subtask.entity';
import { Comment } from './comment.entity';
import { Category } from './category.entity';
import { Role } from './role.entity';
import { Activity } from './activity.entity';
import { Project } from './project.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    telephone: number;

    @Column()
    passwordHash: string;

    @Column()
    imageUrl: string;

    @Column()
    roleId: string;

    @Column()
    projectId: string;

    @Column({ default: true })
    active: boolean;

    @OneToMany(() => Task, task => task.responsible)
    tasks: Task[];

    @OneToMany(() => Subtask, subtask => subtask.responsible)
    subtasks: Subtask[];

    @OneToMany(() => Comment, comment => comment.user)
    comments: Comment[];

    @OneToMany(() => Activity, activity => activity.user)
    activities: Activity[];

    @ManyToOne(() => Role, role => role.users)
    role: Role;

    @ManyToOne(() => Project, project => project.users)
    project: Project;
}
