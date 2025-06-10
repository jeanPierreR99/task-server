import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { CreateOfficeDto } from 'src/dto/office.dto';
import { OfficeService } from 'src/services/office.service';

@Controller('offices')
export class OfficeController {
    constructor(private readonly officeService: OfficeService) { }

    @Post()
    create(@Body() dto: CreateOfficeDto) {
        return this.officeService.create(dto);
    }

    @Get()
    findAll(@Query('name') name?: string) {
        return this.officeService.findAll(name);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.officeService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.officeService.remove(id);
    }
}
