import { IsString, IsNotEmpty, IsUUID, IsDateString } from 'class-validator';

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty()
    comment: string;

    @IsDateString()
    date: string;

    @IsUUID()
    taskId: string;

    @IsUUID()
    userId: string;
}
