import { Controller, Post, Body, Get } from '@nestjs/common';
import { CreateRoleDto } from 'src/dto/role.dto';
import { RoleService } from 'src/services/role.service';

@Controller('roles')
export class RoleController {
    constructor(private readonly roleService: RoleService) { }

    @Post()
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.roleService.create(createRoleDto);
    }

    @Get()
    findAll() {
        return this.roleService.findAll();
    }
}
