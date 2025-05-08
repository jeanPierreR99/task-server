import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CreateProjectDto } from 'src/dto/project.dto';
import { Project } from 'src/entities/project.entity';
import { ProjectService } from 'src/services/project.service';

@Controller('projects')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    @Post()
    create(@Body() dto: CreateProjectDto): Promise<Project> {
        return this.projectService.create(dto);
    }

    @Get()
    findAll(): Promise<Project[]> {
        return this.projectService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Project> {
        return this.projectService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.projectService.remove(id);
    }
}
