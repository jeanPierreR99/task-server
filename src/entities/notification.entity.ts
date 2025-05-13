import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    endpoint: string;

    @Column({ type: 'text' })
    p256dh: string;

    @Column({ type: 'text' })
    auth: string;

    @Column({ type: 'text' })
    userId: string;

    @Column({ type: 'text' })
    userName: string;

    @CreateDateColumn()
    createdAt: Date;
}
