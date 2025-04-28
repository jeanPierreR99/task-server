import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from 'src/dto/category.dto';
import { Category } from 'src/entities/category.entity';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const user = await this.userRepository.findOne({
            where: { id: createCategoryDto.userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const category = this.categoryRepository.create({
            ...createCategoryDto,
            user,
        });

        return this.categoryRepository.save(category);
    }

    async findAll(userId: string): Promise<Category[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.categoryRepository.find({
            where: { user: { id: userId } },
            relations: ['tasks', 'tasks.created_by', 'tasks.responsible'],
        });
    }

    async delete(id: string): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['tasks'],
        });

        if (!category) {
            throw new NotFoundException('Categoría no encontrada');
        }

        if (category.tasks.length > 0) {
            throw new BadRequestException('No puedes eliminar una categoría que tiene tareas');
        }

        await this.categoryRepository.delete(id);
    }

    async findAssignedCategories(userId: string, status: boolean): Promise<Category[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.categoryRepository
            .createQueryBuilder('category')
            .leftJoinAndSelect('category.tasks', 'task')
            .leftJoinAndSelect('task.created_by', 'created_by')
            .leftJoinAndSelect('task.responsible', 'responsible')
            .leftJoinAndSelect('task.subtasks', 'subtask')
            .leftJoinAndSelect('subtask.responsible', 'subtask_responsible')
            .where(
                new Brackets(qb => {
                    qb.where('responsible.id = :userId')
                        .orWhere('subtask_responsible.id = :userId');
                }),
            )
            .andWhere('created_by.id != :userId', { userId })
            .andWhere('task.completed = :status', { status })
            .setParameter('userId', userId)
            .getMany();
    }
}
