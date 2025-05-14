import { Type } from 'class-transformer';
import { IsString, IsEmail, IsOptional, IsUUID, IsNumber, IsArray, ValidateNested } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNumber()
  telephone: number;

  @IsString()
  passwordHash: string;

  @IsOptional()
  @IsString()
  imageUrl: string;

  @IsUUID()
  roleId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectIdDto)
  project: ProjectIdDto[];

  @IsUUID()
  projectId: string;
}

export class LoginUser {

  @IsEmail()
  email: string;

  @IsString()
  passwordHash: string;
}

export class UpdateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNumber()
  telephone: number;

  @IsString()
  passwordHash: string;

  @IsOptional()
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectIdDto)
  project: ProjectIdDto[];

  @IsOptional()
  @IsUUID()
  roleId: string;

  @IsOptional()
  @IsUUID()
  projectId: string;
}

class ProjectIdDto {
  @IsUUID()
  id: string;
}