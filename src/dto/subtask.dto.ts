// src/dto/create-subtask.dto.ts
import { IsString, IsBoolean, IsDateString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateSubtaskDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    completed: boolean;

    @IsDateString()
    dateCulmined: string;

    @IsUUID()
    taskId: string;

    @IsUUID()
    responsibleId: string;
}

export class UpdateSubtaskDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsBoolean()
    completed?: boolean;

    @IsOptional()
    @IsDateString()
    dateCulmined?: string;

    @IsOptional()
    @IsUUID()
    taskId?: string;

    @IsOptional()
    @IsUUID()
    responsibleId?: string;
}