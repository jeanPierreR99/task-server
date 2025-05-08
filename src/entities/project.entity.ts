import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
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

    @OneToMany(() => User, user => user.project)
    users: User[];

    @OneToMany(() => Category, categories => categories.project)
    categories: Category[];
}