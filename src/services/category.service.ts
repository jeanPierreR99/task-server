import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from 'src/dto/category.dto';
import { Project } from 'src/entities';
import { Category } from 'src/entities/category.entity';
import { TaskGateway } from 'src/gateway';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,

        private taskGateway: TaskGateway
    ) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const project = await this.projectRepository.findOne({
            where: { id: createCategoryDto.projectId },
        });

        if (!project) {
            throw new NotFoundException('project not found');
        }

        const category = this.categoryRepository.create({
            ...createCategoryDto,
            project,
            tasks: [],
        });

        const savedCategory = await this.categoryRepository.save(category);

        this.taskGateway.newCategory({ projectId: project.id, category: savedCategory });

        return savedCategory;
    }


    async findAll(projectId: string): Promise<Category[]> {
        const user = await this.projectRepository.findOne({
            where: { id: projectId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.categoryRepository.find({
            where: { project: { id: projectId } },
            relations: ['tasks', 'tasks.created_by', 'tasks.responsible', 'tasks.office'],
        });
    }

    async delete(id: string): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['tasks', 'project'],
        });
        if (!category) {
            throw new NotFoundException('Categoría no encontrada');
        }

        if (category.tasks.length > 0) {
            throw new BadRequestException('No puedes eliminar una categoría que tiene tareas');
        }
        this.taskGateway.deleteCategory({ projectId: category.project.id, category })
        await this.categoryRepository.delete(id);
    }

    async findAssignedCategories(projectId: string, status: boolean): Promise<Category[]> {
        const user = await this.projectRepository.findOne({
            where: { id: projectId },
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
                    qb.where('responsible.id = :projectId')
                        .orWhere('subtask_responsible.id = :projectId');
                }),
            )
            .andWhere('created_by.id != :projectId', { projectId })
            .andWhere('task.completed = :status', { status })
            .setParameter('projectId', projectId)
            .getMany();
    }
}
