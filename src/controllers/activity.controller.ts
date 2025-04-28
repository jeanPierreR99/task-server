import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ActivityService } from 'src/services/activity.service';
import { CreateActivityDto } from 'src/dto/activity.dto';
import { Activity } from 'src/entities/activity.entity';

@Controller('activities')
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    @Post()
    async create(@Body() createActivityDto: CreateActivityDto): Promise<Activity> {
        return this.activityService.create(createActivityDto);
    }

    @Get()
    async findAll(@Query('limit') limit = 10,
        @Query('offset') offset = 0,): Promise<Activity[]> {
        return this.activityService.findAll({ limit: +limit, offset: +offset });
    }


    @Get('user/:userId')
    async findByUser(@Param('userId') userId: string): Promise<Activity[]> {
        return this.activityService.findByUser(userId);
    }

    @Get('task/:taskId')
    async findByTask(@Param('taskId') taskId: string): Promise<Activity[]> {
        return this.activityService.findByTask(taskId);
    }
}
