import { Controller, Post, Get, Body } from '@nestjs/common';
import { CreatePrintScannerDto } from 'src/dto/printScanner.dto';
import { PrintScanner } from 'src/entities/printScanner.entity';
import { PrintScannerService } from 'src/services/printScanner.service';

@Controller('print-scanners')
export class PrintScannerController {
    constructor(private readonly printScannerService: PrintScannerService) { }

    @Post()
    create(@Body() createDto: CreatePrintScannerDto): Promise<PrintScanner> {
        return this.printScannerService.create(createDto);
    }

    @Get()
    findAll(): Promise<PrintScanner[]> {
        return this.printScannerService.findAll();
    }
}
