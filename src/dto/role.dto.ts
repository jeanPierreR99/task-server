// src/dto/create-role.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}
