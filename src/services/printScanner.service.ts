import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePrintScannerDto } from 'src/dto/printScanner.dto';
import { PrintScanner } from 'src/entities/printScanner.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PrintScannerService {
    constructor(
        @InjectRepository(PrintScanner)
        private readonly printScannerRepository: Repository<PrintScanner>,
    ) { }

    async create(createDto: CreatePrintScannerDto): Promise<PrintScanner> {
        const newEntry = this.printScannerRepository.create(createDto);
        return this.printScannerRepository.save(newEntry);
    }

    async findAll(): Promise<PrintScanner[]> {
        return this.printScannerRepository.find();
    }
}
