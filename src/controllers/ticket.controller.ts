import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CreateTicketDto, UpdateTicketDto } from 'src/dto/ticket.dto';
import { TicketService } from 'src/services/ticket.service';

@Controller('tickets')
export class TicketController {
    constructor(private readonly ticketService: TicketService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createTicketDto: CreateTicketDto) {
        return this.ticketService.create(createTicketDto);
    }

    @Get()
    findAll() {
        return this.ticketService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ticketService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
        return this.ticketService.update(id, updateTicketDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.ticketService.remove(id);
    }
}
