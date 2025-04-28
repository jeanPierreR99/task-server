import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { SubtaskService } from 'src/services/subtask.service';
import { Subtask } from 'src/entities/subtask.entity';
import { CreateSubtaskDto, UpdateSubtaskDto } from 'src/dto/subtask.dto';

@Controller('subtasks')
export class SubtaskController {
    constructor(private readonly subtaskService: SubtaskService) { }

    @Post()
    async create(@Body() createSubtaskDto: CreateSubtaskDto): Promise<Subtask> {
        return this.subtaskService.create(createSubtaskDto);
    }

    @Get('task/:taskId')
    async findByTask(@Param('taskId') taskId: string): Promise<Subtask[]> {
        return this.subtaskService.findByTask(taskId);
    }

    @Get()
    async findAll(): Promise<Subtask[]> {
        return this.subtaskService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Subtask> {
        return this.subtaskService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateSubtaskDto: UpdateSubtaskDto): Promise<Subtask> {
        return this.subtaskService.update(id, updateSubtaskDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.subtaskService.remove(id);
    }
}
