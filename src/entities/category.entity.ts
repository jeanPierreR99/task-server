import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';

@Entity()
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;
    
    @Column({ default: false })
    index: boolean;


    @ManyToOne(() => User, user => user.categories)
    user: User;

    @OneToMany(() => Task, task => task.category)
    tasks: Task[];
}
