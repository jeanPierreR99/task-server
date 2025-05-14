import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { CreateUserDto, LoginUser, UpdateUserDto } from 'src/dto/user.dto';
import { UserService } from 'src/services/user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    create(@Body() createUser: CreateUserDto) {
        return this.userService.create(createUser);
    }

    @Get('project/:id')
    findProjectAll(@Param('id') id: string) {
        return this.userService.findProjectAll(id);
    }

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get('/search/:userId')
    findById(@Param('userId') userId: string) {
        return this.userService.findById(userId);
    }

    @Patch(':id/projects')
    async updateUserProjects(
        @Param('id') userId: string,
        @Body() body: string[]
    ) {
        return this.userService.updateUserProjects(userId, body);
    }

    @Post('login')
    async login(@Body() loginUser: LoginUser) {
        try {
            const user = await this.userService.login(loginUser);
            return {
                message: 'Login exitoso',
                data: user,
            };
        } catch (error) {
            return {
                message: 'Credenciales inválidas',
                error: error.message,
            };
        }
    }

    @Get('search')
    async search(@Query('q') query: string, @Query('projectId') projectId: string) {
        return this.userService.searchByName(query, projectId);
    }

    @Patch(':userId/role')
    async changeRole(@Param('userId') userId: string, @Body('roleId') roleId: string) {
        const updatedUser = await this.userService.changeRole(userId, roleId);
        return {
            message: 'Rol actualizado correctamente',
            data: updatedUser,
        };
    }

    @Patch(':userId/active')
    async changeActiveStatus(@Param('userId') userId: string, @Body('isActive') isActive: boolean) {
        const updatedUser = await this.userService.changeActiveStatus(userId, isActive);
        return {
            message: `Usuario ${isActive ? 'activado' : 'desactivado'} correctamente`,
            data: updatedUser,
        };
    }

    @Put(':userId')
    async update(@Param('userId') userId: string, @Body() data: UpdateUserDto) {
        return await this.userService.update(userId, data);
    }
}
