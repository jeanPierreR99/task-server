import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOfficeDto } from 'src/dto/office.dto';
import { Office } from 'src/entities/Office.entity';
import { ILike, Repository } from 'typeorm';

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

    async findAll(name?: string): Promise<Office[]> {
        if (name) {
            return this.officeRepository.find({
                where: [
                    { name: ILike(`%${name}%`), },
                    { siglas: ILike(`%${name}%`), }
                ],
            });
        }

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
