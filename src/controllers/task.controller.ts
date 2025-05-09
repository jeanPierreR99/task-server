import { Controller, Post, Body, Param, Get, Patch, Query, Put, Delete, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { TaskService } from 'src/services/task.service';
import { CreateTaskDto } from 'src/dto/task.dto';
import { Task } from 'src/entities/task.entity';

@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    @Post()
    async create(
        @Body() createTaskDto: CreateTaskDto,
    ) {
        return this.taskService.create(createTaskDto);
    }

    @Get()
    async findAll(): Promise<Task[]> {
        return this.taskService.findAll();
    }
    @Get('ticket')
    async findAllTicket(): Promise<Task[]> {
        return this.taskService.findAllTicket();
    }
    @Get('user/:userId')
    async findAllFalse(@Param('userId') userId: string): Promise<Task[]> {
        return this.taskService.findAllFalse(userId);
    }
    @Get(':status/project/:projectId')
    async findFalse(@Param('projectId') projectId: string, @Param('status') status: string): Promise<Task[]> {
        const parsedStatus = status === 'true';
        return this.taskService.findFalse(projectId, parsedStatus);
    }

    @Get("files/task/:idTask")
    async findFileJoin(@Param('idTask') idTask: string): Promise<Task[]> {
        return this.taskService.findFileJoin(idTask);
    }

    @Patch('category')
    updateCategory(
        @Query('id_task') idTask: string,
        @Query('id_category') idCategory: string,
    ) {
        return this.taskService.updateCategory(idTask, idCategory);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Query('id') idUser: string, @Body() updateTaskDto: any): Promise<Task> {
        return this.taskService.update(id, idUser, updateTaskDto);
    }

    @Delete(':taskId/user/:userId')
    async deleteById(
        @Param('taskId') taskId: string,
        @Param('userId') userId: string,
    ): Promise<void> {

        await this.taskService.deleteById(taskId, userId);


    }

    @Patch(':id/status')
    async updateTaskStatus(
        @Param('id') id: string,
        @Body('completed') completed: boolean,
    ) {
        const updatedTask = await this.taskService.updateStatus(id, completed);

        if (!updatedTask) throw new NotFoundException('Tarea no encontrada');

        return updatedTask;
    }
}

