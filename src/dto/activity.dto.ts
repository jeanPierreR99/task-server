import { IsNotEmpty, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';

export class CreateActivityDto {
    @IsString()
    @IsNotEmpty()
    action: string;

    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @IsDateString()
    @IsNotEmpty()
    create_at: string;

    @IsUUID()
    @IsOptional()
    taskId?: string;

    @IsUUID()
    @IsOptional()
    subtaskId?: string;
}
