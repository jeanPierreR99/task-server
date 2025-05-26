import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity, Category, Office, PrintScanner, Project, Role, Subtask, Task, User, Comment, File, Ticket, Notification } from 'src/entities';
import { ActivityService, CategoryService, CommentService, FileService, NotificationService, OfficeService, PrintScannerService, ProjectService, RoleService, SeedService, SubtaskService, TaskService, TicketService, UserService } from 'src/services';
import { RoleController, UserController, CategoryController, UploadController, TaskController, SubtaskController, CommentController, FileController, ActivityController, PrintScannerController, OfficeController, ProjectController, TicketController, NotificationController } from 'src/controllers';
import { CommentGateway, ActivityGateway, TaskGateway } from 'src/gateway';
import { TicketCounter } from 'src/entities/ticketCounter.entity';
import { TicketGateway } from 'src/gateway/ticket.gateway';
import { DashboardService } from 'src/services/dashboard.service';
import { DashboardController } from 'src/controllers/dashboard.controller';

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
            Office,
            Project,
            Ticket,
            TicketCounter,
            Notification
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
        TicketGateway,
        SeedService,
        PrintScannerService,
        OfficeService,
        ProjectService,
        TicketService,
        NotificationService,
        DashboardService
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
        OfficeController,
        ProjectController,
        TicketController,
        NotificationController,
        DashboardController

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
