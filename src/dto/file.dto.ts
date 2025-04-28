import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateFileDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    url: string;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsUUID()
    taskId?: string;

    @IsOptional()
    @IsUUID()
    subtaskId?: string;

    @IsOptional()
    @IsUUID()
    commentId?: string;
}
