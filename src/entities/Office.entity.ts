import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class Office {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    siglas: string;

    @OneToMany(() => Task, task => task.office)
    tasks: Task[];
}
