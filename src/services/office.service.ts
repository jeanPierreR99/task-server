import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOfficeDto } from 'src/dto/office.dto';
import { Office } from 'src/entities/Office.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OfficeService {
    constructor(
        @InjectRepository(Office)
        private readonly officeRepository: Repository<Office>,
    ) { }

    async create(dto: CreateOfficeDto): Promise<Office> {
        const office = this.officeRepository.create(dto);
        return this.officeRepository.save(office);
    }

    async findAll(): Promise<Office[]> {
        return this.officeRepository.find();
    }

    async findOne(id: string): Promise<Office> {
        const office = await this.officeRepository.findOne({ where: { id } });
        if (!office) {
            throw new NotFoundException('Office not found');
        }
        return office;
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.officeRepository.delete(id);
    }
}
