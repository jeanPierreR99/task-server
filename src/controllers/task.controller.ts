import { Controller, Post, Body, Param, Get, Patch, Query, Put, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { TaskService } from 'src/services/task.service';
import { CreateTaskDto, UpdateTaskDto } from 'src/dto/task.dto';
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
    @Get(':status/user/:userId')
    async findFalse(@Param('userId') userId: string, @Param('status') status: string): Promise<Task[]> {
        const parsedStatus = status === 'true';
        return this.taskService.findFalse(userId, parsedStatus);
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
    async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto): Promise<Task> {
        return this.taskService.update(id, updateTaskDto);
    }

    @Delete(':taskId/user/:userId')
    async deleteById(
        @Param('taskId') taskId: string,
        @Param('userId') userId: string,
    ): Promise<void> {
        try {
            await this.taskService.deleteById(taskId, userId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException('Error al eliminar la tarea', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

