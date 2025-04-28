// src/controllers/file.controller.ts
import { Controller, Post, Body, Get, Param, UseInterceptors, UploadedFile, UploadedFiles, NotFoundException, Query } from '@nestjs/common';
import { FileService } from 'src/services/file.service';
import { File } from 'src/entities/file.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { diskStorage } from 'multer';

@Controller('files')
export class FileController {
    constructor(private readonly fileService: FileService) { }

    @Get()
    async findAll() {
        return this.fileService.findAll();
    }

    @Get('user/:userId')
    async findByUser(@Param('userId') userId: string): Promise<File[]> {
        return this.fileService.findByUser(userId);
    }

    @Get('task/:taskId')
    findByTask(@Param('taskId') taskId: string) {
        return this.fileService.findByTaskComment(taskId);
    }

    @Get('subtask/:subtaskId')
    findBySubtask(@Param('subtaskId') subtaskId: string) {
        return this.fileService.findBySubtask(subtaskId);
    }

    @Post(':userId')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (req, file, callback) => {
                    const userId = req.params.userId;
                    const userFolder = path.join(__dirname, '..', '..', 'uploads', userId);

                    if (!fs.existsSync(userFolder)) {
                        fs.mkdirSync(userFolder, { recursive: true });
                    }

                    callback(null, userFolder);
                },
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = path.extname(file.originalname);
                    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;

                    callback(null, filename);
                },
            }),
        }),
    )
    async uploadFile(
        @Param('userId') userId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new Error('No file uploaded....');
        }

        return this.fileService.uploadToUserFolder(userId, file);
    }

    @Post('subtask/:id')
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = path.extname(file.originalname);
                    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )
    async uploadToSubtask(
        @Param('id') subtaskId: string,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.fileService.saveFilesToSubtask(subtaskId, files);
    }

    @Post('directory/:userId')
    async createFolder(@Param('userId') userId: string, @Body('folderName') folderName: string) {
        return this.fileService.createUserFolder(userId, folderName);
    }
    @Get('directory/:userId')
    async getUserFolders(@Param('userId') userId: string) {
        return this.fileService.getUserFolder(userId);
    }

    @Get('folder/:userId/:nameFolder')
    async findInFolder(@Param('userId') userId: string, @Param('nameFolder') nameFolder: string) {
        return this.fileService.findInFolder(userId, nameFolder);
    }

    @Post('folder/:userId/:folderName')
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: diskStorage({
                destination: (req, file, callback) => {
                    const userId = req.params.userId;
                    const folderName = req.params.folderName;
                    const userFolder = path.join(__dirname, '..', '..', 'uploads', userId, folderName);

                    if (!fs.existsSync(userFolder)) {
                        fs.mkdirSync(userFolder, { recursive: true });
                    }

                    callback(null, userFolder);
                },
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = path.extname(file.originalname);
                    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;

                    callback(null, filename);
                },
            }),
        }),
    )
    async saveFilesToFolder(
        @Param('userId') userId: string,
        @Param('folderName') folderName: string,
        @UploadedFiles() files: Express.Multer.File[],
    ) {

        return this.fileService.saveFilesToFolder(userId, folderName, files)
    }

}
