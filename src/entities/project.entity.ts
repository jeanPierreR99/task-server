import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';
import { Category } from './category.entity';

@Entity()
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @ManyToMany(() => User, user => user.projects)
    users: User[];

    @OneToMany(() => Category, categories => categories.project)
    categories: Category[];
}