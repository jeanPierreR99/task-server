import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RoleService } from 'src/services/role.service';
import { RoleController } from 'src/controllers/role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/entities/role.entity';
import { User } from 'src/entities/user.entity';
import { UserController } from 'src/controllers/user.controller';
import { UserService } from 'src/services/user.service';
import { CategoryService } from 'src/services/category.service';
import { CategoryController } from 'src/controllers/category.controller';
import { Category } from 'src/entities/category.entity';
import { Task } from 'src/entities/task.entity';
import { TaskService } from 'src/services/task.service';
import { TaskController } from 'src/controllers/task.controller';
import { Subtask } from 'src/entities/subtask.entity';
import { SubtaskService } from 'src/services/subtask.service';
import { SubtaskController } from 'src/controllers/subtask.controller';
import { CommentService } from 'src/services/comment.service';
import { CommentController } from 'src/controllers/comment.controller';
import { Comment } from 'src/entities/comment.entity';
import { FileService } from 'src/services/file.service';
import { FileController } from 'src/controllers/file.controller';
import { File } from 'src/entities/file.entity';
import { Activity } from 'src/entities/activity.entity';
import { ActivityService } from 'src/services/activity.service';
import { ActivityController } from 'src/controllers/activity.controller';
import { UploadController } from 'src/controllers/upload.controller';
import { CommentGateway } from 'src/gateway/comment.gateway';
import { ActivityGateway } from 'src/gateway/activity.gateway';
import { SeedService } from 'src/services/seed.service';
import { TaskGateway } from 'src/gateway/task.gateway';
import { PrintScannerController } from 'src/controllers/printScanner.controller';
import { PrintScannerService } from 'src/services/printScanner.service';
import { PrintScanner } from 'src/entities/printScanner.entity';
import { Office } from 'src/entities/Office.entity';
import { OfficeService } from 'src/services/office.service';
import { OfficeController } from 'src/controllers/office.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        TypeOrmModule.forFeature([
            Role,
            User,
            Category,
            Task,
            Subtask,
            Comment,
            File,
            Activity,
            PrintScanner,
            Office
        ]),
    ],
    providers: [
        RoleService,
        UserService,
        CategoryService,
        TaskService,
        SubtaskService,
        CommentService,
        FileService,
        ActivityService,
        CommentGateway,
        ActivityGateway,
        TaskGateway,
        SeedService,
        PrintScannerService,
        OfficeService,
    ],
    controllers: [
        RoleController,
        UserController,
        CategoryController,
        UploadController,
        TaskController,
        SubtaskController,
        CommentController,
        FileController,
        ActivityController,
        PrintScannerController,
        OfficeController

    ],
    exports: [SeedService],
})

export class AppModule {
    private readonly logger = new Logger(AppModule.name);
    constructor(private readonly seedService: SeedService) { }

    async onModuleInit() {
        try {
            await this.seedService.run();
        } catch (error) {
            this.logger.error('Error al correr el SeedService', error);
        }
    }
}
