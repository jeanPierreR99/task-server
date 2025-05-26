import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

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

    @Column({ default: "Normal" })
    status_string: string;

    @CreateDateColumn({ type: 'timestamp' })
    create_at: Date;

    @Column({ type: 'timestamp', precision: 3, nullable: true })
    update_at: Date;

    @Column({ default: false })
    status: boolean;

    @Column({ default: "Pendiente" })
    descriptionStatus: string;
}
