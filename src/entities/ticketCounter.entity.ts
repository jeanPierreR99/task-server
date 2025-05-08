import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class TicketCounter {
    @PrimaryColumn() // ya no es autogenerado
    id: number;

    @Column({ default: 0 })
    lastNumber: number;
}
