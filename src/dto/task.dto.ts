import { IsString, IsBoolean, IsDateString, IsUUID, IsOptional } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsBoolean()
    completed: boolean;

    @IsString()
    created_by: string;

    @IsString()
    status: string;

    @IsDateString()
    dateCulmined: string;

    @IsString()
    responsibleId: string;

    @IsString()
    categoryId: string;

    @IsString()
    officeId: string;
}

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsBoolean()
    completed: boolean;

    @IsOptional()
    @IsString()
    created_by: string;

    @IsOptional()
    @IsString()
    status: string;

    @IsOptional()
    @IsDateString()
    dateCulmined: string;

    @IsOptional()
    @IsString()
    responsibleId: string;

    @IsOptional()
    @IsString()
    categoryId: string;

    @IsOptional()
    @IsString()
    officeId: string;
}
