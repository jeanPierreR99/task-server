import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateActivityDto } from 'src/dto/activity.dto';
import { Activity } from 'src/entities/activity.entity';
import { User } from 'src/entities/user.entity';
import { Task } from 'src/entities/task.entity';
import { Subtask } from 'src/entities/subtask.entity';
import { GetDay } from 'src/utils/date';

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(Activity)
        private activityRepository: Repository<Activity>,

        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Task)
        private taskRepository: Repository<Task>,

        @InjectRepository(Subtask)
        private subtaskRepository: Repository<Subtask>,
    ) { }

    async create(createActivityDto: CreateActivityDto): Promise<Activity> {
        const user = await this.userRepository.findOne({
            where: { id: createActivityDto.userId },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        let task = null;
        if (createActivityDto.taskId) {
            task = await this.taskRepository.findOne({
                where: { id: createActivityDto.taskId },
            });
            if (!task) {
                throw new NotFoundException('Task not found');
            }
        }

        let subtask = null;
        if (createActivityDto.subtaskId) {
            subtask = await this.subtaskRepository.findOne({
                where: { id: createActivityDto.subtaskId },
            });
            if (!subtask) {
                throw new NotFoundException('Subtask not found');
            }
        }

        const activity = this.activityRepository.create({
            action: createActivityDto.action,
            create_at: GetDay(),
            user,
            task,
            subtask,
        });

        return this.activityRepository.save(activity);
    }

    async findAll({ limit, offset }: { limit: number; offset: number }): Promise<Activity[]> {
        return this.activityRepository.find({
            relations: ['user', 'task', 'subtask', 'files', 'comment'],
            skip: offset,
            take: limit,
            order: {
                create_at: 'DESC'
            },
        });
    }

    async findByUser(userId: string): Promise<Activity[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Activity not found');
        }

        return this.activityRepository.find({
            where: { user: { id: userId } },
            relations: ['user', 'task', 'subtask', 'files', 'comment'],
            order: {
                create_at: 'DESC'
            },
        });
    }

    async findByTask(taskId: string): Promise<Activity[]> {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return this.activityRepository.find({
            where: { task: { id: taskId } },
            relations: ['user'],
        });
    }
}
