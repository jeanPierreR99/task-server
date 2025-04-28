// src/controllers/comment.controller.ts
import { Controller, Post, Body, Get, Param, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CommentService } from 'src/services/comment.service';
import { Comment } from 'src/entities/comment.entity';
import { CreateCommentDto } from 'src/dto/comment.dto';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('comments')
export class CommentController {
    constructor(private readonly commentService: CommentService) { }

    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'files', maxCount: 10 }], {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )
    async create(
        @Body() createCommentDto: CreateCommentDto,
        @UploadedFiles() files: { files?: Express.Multer.File[] } = {},
    ) {
        const uploadedFiles = files?.files ?? [];
        return this.commentService.create(createCommentDto, uploadedFiles);
    }

    @Get('task/:taskId')
    findByTask(@Param('taskId') taskId: string) {
        return this.commentService.findByTask(taskId);
    }
}
