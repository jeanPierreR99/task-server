import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { Category } from 'src/entities/category.entity';
import { CreateTaskDto, UpdateTaskDto } from 'src/dto/task.dto';
import { TaskGateway } from 'src/gateway/task.gateway';
import { Office } from 'src/entities/Office.entity';

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

        private taskGateway: TaskGateway,

    ) { }

    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        const responsible = await this.userRepository.findOne({
            where: { id: createTaskDto.responsibleId },
        });

        const category = await this.categoryRepository.findOne({
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

        await this.taskGateway.newTaskAsigned({ userId: responsible.id, task })
        return this.taskRepository.save(task);
    }

    async findAll(): Promise<Task[]> {
        return this.taskRepository.find({
            relations: ['responsible', 'created_by', 'subtasks', 'subtasks.files', 'office', 'comments', 'files', 'category', 'activities', 'activities.user'],
        });
    }

    async findFalse(userId: string, status: boolean): Promise<Task[]> {
        return this.taskRepository.find({
            where: { created_by: { id: userId }, completed: status },
        });
    }

    async findAllFalse(userId: string): Promise<Task[]> {
        return this.taskRepository.find({
            where: [
                { created_by: { id: userId }, completed: false },
                { responsible: { id: userId }, completed: false },
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
        const task = await this.taskRepository.findOne({ where: { id: idTask } });
        if (!task) throw new NotFoundException('Tarea no encontrada');
        const category = await this.categoryRepository.findOne({ where: { id: idCategory } });
        if (!category) throw new NotFoundException('Categoría no encontrada');

        task.category = category;
        return this.taskRepository.save(task);
    }

    async update(idTask: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
        const task = await this.taskRepository.findOne({
            where: { id: idTask },
            relations: ['responsible']
        });

        if (!task) throw new NotFoundException('Tarea no encontrada');

        if (updateTaskDto.responsibleId) {
            const user = await this.userRepository.findOne({ where: { id: updateTaskDto.responsibleId } });
            if (!user) throw new NotFoundException('Usuario responsable no encontrado');
            task.responsible = user;
        }

        const { responsibleId, ...rest } = updateTaskDto;
        Object.assign(task, rest);

        return this.taskRepository.save(task);
    }


    async deleteById(taskId: string, userId: string): Promise<void> {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: ['responsible', 'created_by'],
        });

        if (!task) {
            throw new NotFoundException('Tarea no encontrada');
        }

        if (task.responsible.id !== userId && task.created_by.id !== userId) {
            throw new ForbiddenException('No tienes permiso para eliminar esta tarea');
        }

        await this.taskRepository.remove(task);
    }

}
