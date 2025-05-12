import { IsBoolean, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateTicketDto {
    @IsString()
    description: string;

    @IsString()
    requestedBy: string;

    @IsString()
    area: string;

    @IsDateString()
    create_at: string;

    @IsOptional()
    @IsBoolean()
    status?: boolean;

    @IsOptional()
    @IsDateString()
    update_at?: string;
}


export class UpdateTicketDto {
    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    requestedBy: string;

    @IsOptional()
    @IsString()
    area: string;

    @IsOptional()
    @IsDateString()
    createdAt: string;

    @IsOptional()
    @IsBoolean()
    status: boolean;

    @IsOptional()
    descriptionStatus: string;

    @IsOptional()
    @IsDateString()
    update_at: string;
}
