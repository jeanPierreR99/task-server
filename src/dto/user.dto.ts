import { IsString, IsEmail, IsOptional, IsUUID, IsNumber } from 'class-validator';

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
}