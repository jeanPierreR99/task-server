import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { CreateProjectDto } from 'src/dto/project.dto';
import { Category, Task } from 'src/entities';
import { Project } from 'src/entities/project.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
    ) { }

    async create(dto: CreateProjectDto): Promise<Project> {
        const project = this.projectRepository.create(dto);

        const savedProject = await this.projectRepository.save(project);

        const defaultCategory = this.categoryRepository.create({
            title: 'Añadidas recientes',
            project: savedProject,
            index: true,
        });
        await this.categoryRepository.save(defaultCategory);

        const uploadBasePath = path.join(__dirname, '..', '..', 'uploads');
        const userFolder = path.join(uploadBasePath, savedProject.id.toString());

        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }

        return savedProject;
    }


    async findAll(): Promise<Project[]> {
        return this.projectRepository.find({ relations: ['users', 'categories.tasks'] });
    }

    async findOne(id: string, limit = 1, page = 1): Promise<Project & { totalPages: number }> {
        console.log(id)
        console.log(limit)
        console.log(page)
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['users', 'categories'],
        });

        if (!project) throw new NotFoundException('Proyecto no encontrado');

        const skip = (page - 1) * limit;

        let maxPages = 0;

        await Promise.all(
            project.categories.map(async (category) => {
                const [tasks, total] = await this.taskRepository.findAndCount({
                    where: { category: { id: category.id } },
                    relations: ['responsible', 'created_by', 'office'],
                    order: { dateCulmined: 'DESC' },
                    take: limit,
                    skip,
                });

                (category as any).tasks = tasks;

                const pages = Math.ceil(total / limit);
                if (pages > maxPages) maxPages = pages;
            })
        );

        return { ...project, totalPages: maxPages };
    }






    async remove(id: string): Promise<void> {
        const project = await this.projectRepository.findOne({ where: { id } });
        await this.projectRepository.remove(project);
    }
}
