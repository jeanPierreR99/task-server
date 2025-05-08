import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from 'src/entities/comment.entity';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { CreateCommentDto } from 'src/dto/comment.dto';
import { File } from 'src/entities/file.entity';
import { CommentGateway } from 'src/gateway/comment.gateway';
import { Activity } from 'src/entities/activity.entity';
import { ActivityGateway } from 'src/gateway/activity.gateway';
import { GetDay } from 'src/utils/date';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,

        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,


        @InjectRepository(File)
        private readonly fileRepository: Repository<File>,

        @InjectRepository(Activity)
        private readonly activityRepository: Repository<Activity>,

        private commentGateway: CommentGateway,

        private activityGateway: ActivityGateway

    ) { }

    async create(createCommentDto: CreateCommentDto, files: Express.Multer.File[] = []): Promise<Comment & { files?: File[] }> {
        const { taskId, userId, comment, date } = createCommentDto;

        const task = await this.taskRepository.findOne({ where: { id: taskId } });
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const newComment = this.commentRepository.create({
            comment,
            date,
            task,
            user,
        });
        const savedComment = await this.commentRepository.save(newComment);

        const savedFiles: File[] = [];

        if (files.length > 0) {
            for (const file of files) {
                const savedFile = this.fileRepository.create({
                    name: file.originalname,
                    reference: user.id,
                    uploaded_in: GetDay(),
                    url: `/uploads/${file.filename}`,
                    comment: savedComment,
                });

                const fileEntity = await this.fileRepository.save(savedFile);
                savedFiles.push(fileEntity);
            }
        }

        const newData = {
            ...savedComment,
            files: savedFiles.length > 0 ? savedFiles : null,
        };
        const activity = this.activityRepository.create({
            action: `Comentó la tarea y subió ${files.length} archivo${files.length !== 1 ? 's' : ''}`,
            createdAt: GetDay(),
            user,
            task,
            comment: newComment,
            files: savedFiles.length > 0 ? savedFiles : undefined,
        });

        await this.activityRepository.save(activity);

        this.commentGateway.newComment({ taskId, comment: newData });
        this.activityGateway.newActivity({ data: activity });

        return newData;
    }



    async findByTask(idTask: string): Promise<Comment[]> {
        const task = await this.taskRepository.findOne({
            where: { id: idTask },
        });
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return this.commentRepository.find({
            where: { task: { id: idTask } },
            relations: ['user', 'files'],
            order: { date: 'DESC' },
        });
    }
}
