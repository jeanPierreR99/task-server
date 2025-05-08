import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';
import { Project } from './project.entity';

@Entity()
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ default: false })
    index: boolean;

    @OneToMany(() => Task, task => task.category)
    tasks: Task[];

    @ManyToOne(() => Project, Project => Project.categories)
    project: Project;
}
