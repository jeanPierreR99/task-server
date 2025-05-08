import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    code: string;

    @Column({ type: 'text' })
    description: string;

    @Column()
    requestedBy: string;

    @Column()
    area: string;

    @Column({ type: 'timestamp', precision: 3 })
    createdAt: Date;

    @Column({ type: 'timestamp', precision: 3, nullable: true })
    updatedAt: Date;

    @Column({ default: false })
    status: boolean;
}
