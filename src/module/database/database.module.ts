import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Comment } from 'src/entities/comment.entity';
import { Category } from 'src/entities/category.entity';
import { File } from 'src/entities/file.entity';
import { Role } from 'src/entities/role.entity';
import { Subtask } from 'src/entities/subtask.entity';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { Activity } from 'src/entities/activity.entity';
import { PrintScanner } from 'src/entities/printScanner.entity';
import { Office } from 'src/entities/Office.entity';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'mysql',
                host: config.get<string>('DB_HOST'),
                port: config.get<number>('DB_PORT'),
                username: config.get<string>('DB_USER'),
                password: config.get<string>('DB_PASSWORD'),
                database: config.get<string>('DB_NAME'),
                entities: [Category, Comment, File, Role, Subtask, Task, User, Activity, PrintScanner, Office],
                synchronize: true,
                // logging: true,
                // logger: 'advanced-console',
            }),
        }),
    ],
})
export class DatabaseModule { }
