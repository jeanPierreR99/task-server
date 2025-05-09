import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTicketDto, UpdateTicketDto } from 'src/dto/ticket.dto';
import { Task, Ticket } from 'src/entities';
import { TicketCounter } from 'src/entities/ticketCounter.entity';
import { TicketGateway } from 'src/gateway/ticket.gateway';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TicketService {
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        private readonly dataSource: DataSource,
        private ticketGateway: TicketGateway,

    ) { }

    async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
        const nextNumber = await this.dataSource.transaction(async (manager) => {
            const counterRepo = manager.getRepository(TicketCounter);

            const counter = await counterRepo.findOne({
                where: { id: 1 },
                lock: { mode: 'pessimistic_write' },
            });

            if (!counter) {
                throw new ConflictException('El contador de tickets no está inicializado');
            }

            counter.lastNumber += 1;
            await counterRepo.save(counter);

            return counter.lastNumber;
        });

        const formattedCode = `TCK-${nextNumber.toString().padStart(5, '0')}`;

        const ticket = this.ticketRepository.create({
            ...createTicketDto,
            code: formattedCode,
        });

        const savedTicket = await this.ticketRepository.save(ticket);

        const task = this.taskRepository.create({
            name: formattedCode,
            description: `${createTicketDto.requestedBy} solicita: ${createTicketDto.description} en el area de: ${createTicketDto.area}`,
            completed: false,
            status: 'pendiente',
            ticket: true,
            dateCulmined: createTicketDto.createdAt,
            responsible: null
        });

        await this.taskRepository.save(task);

        await this.ticketGateway.newTicket({ data: ticket })
        await this.ticketGateway.newTaskTicket({ data: task })
        return savedTicket;
    }




    async findAll(): Promise<Ticket[]> {
        return await this.ticketRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Ticket> {
        const ticket = await this.ticketRepository.findOne({ where: { id } });
        if (!ticket) {
            throw new NotFoundException(`Ticket with id ${id} not found`);
        }
        return ticket;
    }

    async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
        const ticket = await this.findOne(id);

        const updated = this.ticketRepository.merge(ticket, {
            ...updateTicketDto,
            updatedAt: updateTicketDto.updatedAt ? new Date(updateTicketDto.updatedAt) : new Date(),
        });

        return await this.ticketRepository.save(updated);
    }

    async remove(id: string): Promise<void> {
        const ticket = await this.findOne(id);
        await this.ticketRepository.remove(ticket);
    }
}
