import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Category, Role, Subtask, Task, User, Activity, PrintScanner, Office, Project, File, Comment, Ticket, Notification } from 'src/entities';
import { TicketCounter } from 'src/entities/ticketCounter.entity';

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
                entities: [Category, Comment, File, Role, Subtask, Task, User, Activity, PrintScanner, Office, Project, Ticket, TicketCounter, Notification],
                synchronize: true,
                // logging: true,
                // logger: 'advanced-console',
            }),
        }),
    ],
})
export class DatabaseModule { }
