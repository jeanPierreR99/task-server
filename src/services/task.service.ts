import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { Category } from 'src/entities/category.entity';
import { CreateTaskDto } from 'src/dto/task.dto';
import { TaskGateway } from 'src/gateway/task.gateway';
import { Office } from 'src/entities/Office.entity';
import { ActivityGateway } from 'src/gateway/activity.gateway';
import { Activity } from 'src/entities/activity.entity';
import { TicketGateway } from 'src/gateway/ticket.gateway';
import { Ticket } from 'src/entities';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,

        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,

        @InjectRepository(Office)
        private officeRepository: Repository<Office>,

        @InjectRepository(Ticket)
        private ticketRepository: Repository<Ticket>,

        @InjectRepository(Activity)
        private activityRepository: Repository<Activity>,
        private taskGateway: TaskGateway,
        private activityGateway: ActivityGateway,
        private ticketGateway: TicketGateway,
    ) { }

    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        const responsible = await this.userRepository.findOne({
            where: { id: createTaskDto.responsibleId },
        });

        const category = await this.categoryRepository.findOne({
            relations: ['project'],
            where: { id: createTaskDto.categoryId },
        });

        const userCreatingTask = await this.userRepository.findOne({
            where: { id: createTaskDto.created_by },
        });

        const office = await this.officeRepository.findOne({
            where: { id: createTaskDto.officeId },
        });

        if (!responsible) {
            throw new Error('User not found');
        }

        if (!category) {
            throw new Error('Category not found');
        }

        if (!userCreatingTask) {
            throw new Error('User creating task not found');
        }

        if (!office) {
            throw new Error('Office not found');
        }

        const task = this.taskRepository.create({
            ...createTaskDto,
            responsible,
            category,
            created_by: userCreatingTask,
            office
        });

        const savedTask = await this.taskRepository.save(task);

        await this.taskGateway.newTask({ projectId: category.project.id, task: savedTask });

        return savedTask;

    }

    async findAll(): Promise<Task[]> {
        return this.taskRepository.find({
            relations: ['responsible', 'created_by', 'office'],
            order: { dateCulmined: "DESC" }
        });
    }
    async findAllTicket(): Promise<Task[]> {
        return this.taskRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.responsible', 'responsible')
            .leftJoinAndSelect('task.created_by', 'created_by')
            .leftJoinAndSelect('task.office', 'office')
            .where('task.ticket = :ticket', { ticket: true })
            .andWhere('task.responsible IS NULL')
            .orderBy('task.dateCulmined', 'DESC')
            .getMany();
    }


    async findFalse(idProject: string, status: boolean): Promise<Task[]> {
        return this.taskRepository.find({
            where: [
                { category: { project: { id: idProject } }, completed: status },
            ],
        });
    }

    async findAllFalse(idProject: string): Promise<Task[]> {
        return this.taskRepository.find({
            where: [
                { category: { project: { id: idProject } }, completed: false },
            ],
        });
    }

    async findFileJoin(taskId: string): Promise<Task[]> {
        const task = await this.taskRepository.find({
            where: { id: taskId },
            relations: ['subtasks.files',]
        });

        if (!task) throw new NotFoundException('Tarea no encontrada');

        return task;
    }

    async updateCategory(idTask: string, idCategory: string) {
        const task = await this.taskRepository.findOne({ relations: ['category'], where: { id: idTask } });
        if (!task) throw new NotFoundException('Tarea no encontrada');
        const category = await this.categoryRepository.findOne({ relations: ['project'], where: { id: idCategory } });
        if (!category) throw new NotFoundException('Categoría no encontrada');

        task.category = category;
        await this.taskGateway.updateTaskCategory({ projectId: category.project.id, task })
        return this.taskRepository.save(task);
    }

    async updateDate(idTask: string, data: any) {
        const task = await this.taskRepository.findOne({ relations: ['category.project'], where: { id: idTask } });
        if (!task) throw new NotFoundException('Tarea no encontrada');
        task.dateCulmined = data.dateCulmined;
        await this.taskGateway.updateTaskDateProject({ projectId: task.category.project.id, task })
        return this.taskRepository.save(task);
    }

    async update(idTask: string, idUser: string, updateTaskDto: any): Promise<Task> {
        const task = await this.taskRepository.findOne({
            where: { id: idTask },
            relations: ['responsible']
        });

        if (!task) throw new NotFoundException('Tarea no encontrada');

        if (updateTaskDto.responsibleId) {

            const user = await this.userRepository.findOne({ where: { id: updateTaskDto.responsibleId } });

            if (!user) throw new NotFoundException('Usuario responsable no encontrado');

            const userAction = await this.userRepository.findOne({ where: { id: idUser } })

            task.responsible = user;

            const activity = this.activityRepository.create({
                action: `Actualizo de responsable la tarea a ${user.name}`,
                create_at: updateTaskDto.update_at,
                user: userAction,
                task,
            });

            const category = await this.categoryRepository.findOne({
                where: {
                    project: { id: updateTaskDto.projectId },
                    index: true,
                },
            });

            task.category = category;
            await this.taskRepository.save(task)
            await this.activityRepository.save(activity)
            await this.ticketGateway.newTaskTicket({ data: task })
            await this.activityGateway.newActivity({ data: activity })

        }

        const { responsibleId, ...rest } = updateTaskDto;
        Object.assign(task, rest);

        return this.taskRepository.save(task);
    }


    async deleteById(taskId: string, userId: string): Promise<void> {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: ['responsible', 'created_by', 'category.project'],
        });
        if (!task) {
            throw new NotFoundException('Tarea no encontrada');
        }

        if (task.responsible.id !== userId && task.created_by.id !== userId) {
            throw new ForbiddenException('No tienes permiso para eliminar esta tarea');
        }

        await this.taskGateway.deleteTaskProject({ projectId: task.category.project.id, task })
        await this.taskRepository.remove(task);
    }

    async updateStatus(idTask: string, data: any) {
        const task = await this.taskRepository.findOne({ where: { id: idTask }, relations: ['category.project'] });
        if (!task) throw new NotFoundException('Tarea no encontrada');
        task.completed = data.completed;
        task.status = data.status;

        const ticket = await this.ticketRepository.findOne({ where: { code: task.name } });
        if (ticket) {
            await this.ticketRepository.update(ticket.id, {
                status: data.completed,
                update_at: data.update_at,
                descriptionStatus: data.descriptionStatus
            });

            const updatedTicket = await this.ticketRepository.findOneBy({ id: ticket.id });
            await this.ticketGateway.newTicket({ data: updatedTicket });
        }
        await this.taskGateway.updateTaskStatusProject({ projectId: task.category.project.id, task })
        return this.taskRepository.save(task);
    }
}
