// src/services/subtask.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subtask } from 'src/entities/subtask.entity';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { CreateSubtaskDto, UpdateSubtaskDto } from 'src/dto/subtask.dto';

@Injectable()
export class SubtaskService {
    constructor(
        @InjectRepository(Subtask)
        private subtaskRepository: Repository<Subtask>,

        @InjectRepository(Task)
        private taskRepository: Repository<Task>,

        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async create(createSubtaskDto: CreateSubtaskDto): Promise<Subtask> {
        console.log(createSubtaskDto)
        const task = await this.taskRepository.findOne({
            where: { id: createSubtaskDto.taskId },
        });

        const responsible = await this.userRepository.findOne({
            where: { id: createSubtaskDto.responsibleId },
        });

        if (!task) {
            throw new Error('Task not found');
        }

        if (!responsible) {
            throw new Error('User not found');
        }

        const subtask = this.subtaskRepository.create({
            ...createSubtaskDto,
            task,
            responsible,
        });

        return this.subtaskRepository.save(subtask);
    }

    async findByTask(idTask: string): Promise<Subtask[]> {
        const task = await this.taskRepository.findOne({
            where: { id: idTask },
        });

        if (!task) {
            throw new NotFoundException('task not found');
        }

        return this.subtaskRepository.find({
            where: { task: { id: idTask } },
            relations: ['files', 'responsible'],
        });
    }

    async findAll(): Promise<Subtask[]> {
        return this.subtaskRepository.find();
    }

    async findOne(id: string): Promise<Subtask> {
        return this.subtaskRepository.findOne({ where: { id }, relations: ['task', 'responsible', 'files'] });
    }

    async update(idSubTask: string, updateSubtaskDto: UpdateSubtaskDto): Promise<Subtask> {
        const subTask = await this.subtaskRepository.findOne({ where: { id: idSubTask } })

        if (!subTask) throw new NotFoundException('Subtarea no encontrada');

        const updateSubTask = Object.assign(subTask, updateSubtaskDto);

        return this.subtaskRepository.save(updateSubTask);
    }

    async remove(id: string): Promise<void> {
        await this.subtaskRepository.delete(id);
    }
}
