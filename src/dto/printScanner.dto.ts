import { IsOptional, IsString, IsIP, MaxLength } from 'class-validator';

export class CreatePrintScannerDto {
    @IsOptional()
    @IsString()
    sedes?: string;

    @IsOptional()
    @IsString()
    oficina?: string;

    @IsOptional()
    @IsString()
    oficinaEspecifica?: string;

    @IsOptional()
    @IsString()
    codPatrimonial?: string;

    @IsOptional()
    @IsString()
    serie?: string;

    @IsOptional()
    @IsString()
    marca?: string;

    @IsOptional()
    @IsString()
    tipo?: string;

    @IsOptional()
    @IsString()
    modelo?: string;

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsString()
    mac?: string;

    @IsOptional()
    ip?: string;

    @IsOptional()
    @IsString()
    estado?: string;
}
