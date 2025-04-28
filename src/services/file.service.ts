// src/services/file.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from 'src/entities/file.entity';
import { Task } from 'src/entities/task.entity';
import { Subtask } from 'src/entities/subtask.entity';
import { User } from 'src/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
    constructor(
        @InjectRepository(File)
        private fileRepository: Repository<File>,

        @InjectRepository(Task)
        private taskRepository: Repository<Task>,

        @InjectRepository(Subtask)
        private subtaskRepository: Repository<Subtask>,


        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }


    async findAll(): Promise<File[]> {
        return this.fileRepository.find({
            relations: ['task', 'subtask'],
        });
    }

    async findByUser(userId: string): Promise<File[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new Error('User not found');
        }

        return this.fileRepository.find({ where: { reference: userId } });
    }

    async findByTaskComment(taskId: string): Promise<Task> {
        const task = await this.taskRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.comments', 'comment')
            .leftJoinAndSelect('comment.files', 'file')
            .where('task.id = :taskId', { taskId })
            .orderBy('comment.date', 'DESC')
            .getOne();

        if (!task) {
            throw new Error('Task not found');
        }

        return task;
    }

    async findBySubtask(subtaskId: string): Promise<File[]> {
        const subtask = await this.subtaskRepository.findOne({ where: { id: subtaskId } });

        if (!subtask) {
            throw new Error('Subtask not found');
        }

        return this.fileRepository.find({ where: { subtask: { id: subtaskId } } });
    }

    async findInFolder(userId: string, nameFolder: string): Promise<File[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new Error('User not found');
        }

        return this.fileRepository.find({ where: { reference: userId, nameFolder: nameFolder } });
    }

    uploadToUserFolder(userId: string, file: Express.Multer.File): Promise<File> {
        const user = this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }

        const newFile = this.fileRepository.create({
            name: file.originalname,
            reference: userId,
            uploaded_in: new Date(),
            url: `/uploads/${userId}/${file.filename}`,
            task: null,
            subtask: null,
        });

        return this.fileRepository.save(newFile);
    }

    async saveFilesToSubtask(subtaskId: string, files: Express.Multer.File[]) {
        const subtask = await this.subtaskRepository.findOne({
            where: { id: subtaskId }, relations: ['responsible'],
        });

        if (!subtask) throw new NotFoundException('Subtarea no encontrada');

        const savedFiles: File[] = [];

        for (const file of files) {
            const savedFile = this.fileRepository.create({
                name: file.originalname,
                reference: subtask.responsible.id,
                uploaded_in: new Date(),
                url: `/uploads/${file.filename}`,
                subtask: subtask,
            });

            const fileEntity = await this.fileRepository.save(savedFile);
            savedFiles.push(fileEntity);
        }

        return savedFiles;
    }

    async createUserFolder(userId: string, folderName: string) {
        const basePath = path.join(__dirname, '..', '..', 'uploads', userId);
        const newFolderPath = path.join(basePath, folderName);

        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
        }

        if (!fs.existsSync(newFolderPath)) {
            fs.mkdirSync(newFolderPath, { recursive: true });
        }

        const fileCount = fs.readdirSync(newFolderPath)
            .filter(file => fs.statSync(path.join(newFolderPath, file)).isFile())
            .length;

        return {
            folder: folderName,
            totalFiles: fileCount,
        };
    }

    async getUserFolder(userId: string) {
        const basePath = path.join(__dirname, '..', '..', 'uploads', userId);

        if (!fs.existsSync(basePath)) {
            throw new NotFoundException('El directorio del usuario no existe');
        }

        const directories = fs.readdirSync(basePath, { withFileTypes: true });
        const folders = directories.filter(dir => dir.isDirectory()).map(dir => dir.name);

        const folderDetails = folders.map((folder) => {
            const folderPath = path.join(basePath, folder);
            const fileCount = fs.readdirSync(folderPath)
                .filter(file => fs.statSync(path.join(folderPath, file)).isFile())
                .length;

            return {
                folder,
                totalFiles: fileCount,
            };
        });

        return folderDetails;
    }

    async saveFilesToFolder(userId: string, folderName: string, files: Express.Multer.File[]) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) throw new NotFoundException('User not found');

        const savedFiles: File[] = [];

        for (const file of files) {
            const savedFile = this.fileRepository.create({
                name: file.originalname,
                reference: user.id,
                nameFolder: folderName,
                uploaded_in: new Date(),
                inFolder: true,
                url: `/uploads/${userId}/${folderName}/${file.filename}`,
            });

            const fileEntity = await this.fileRepository.save(savedFile);
            savedFiles.push(fileEntity);
        }
        return savedFiles;
    }


}


