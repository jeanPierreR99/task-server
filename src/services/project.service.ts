import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { CreateProjectDto } from 'src/dto/project.dto';
import { Category } from 'src/entities';
import { Project } from 'src/entities/project.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
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

    async findOne(id: string): Promise<Project> {
        const project = await this.projectRepository.findOne({
            relations: ['users', 'categories.tasks.responsible', 'categories.tasks.created_by'],
            where: { id },
        });
        if (!project) throw new NotFoundException('Proyecto no encontrado');
        return project;
    }

    async remove(id: string): Promise<void> {
        const project = await this.findOne(id);
        await this.projectRepository.remove(project);
    }
}
