import { Controller, Post, Body, Get, Param, Query, Delete, HttpCode, BadRequestException, HttpStatus } from '@nestjs/common';
import { CreateCategoryDto } from 'src/dto/category.dto';
import { Category } from 'src/entities/category.entity';
import { CategoryService } from 'src/services/category.service';

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
        return this.categoryService.create(createCategoryDto);
    }

    @Get('user/:userId')
    findAll(@Param('userId') userId: string) {
        return this.categoryService.findAll(userId);
    }

    @Get('assigned/:userId')
    async findAssignedCategories(
        @Param('userId') userId: string,
        @Query('status') status: string
    ): Promise<Category[]> {
        const parsedStatus = status === 'true';
        return this.categoryService.findAssignedCategories(userId, parsedStatus);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteCategory(@Param('id') id: string) {
        try {
            await this.categoryService.delete(id);
            return { message: 'Categoría eliminada correctamente' };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw new BadRequestException('La categoría contiene tareas. No se puede eliminar.');
            }
            throw error;
        }
    }

}
