import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Task } from 'src/entities/task.entity';
import * as dayjs from "dayjs"

@Injectable()
export class ReportExcelService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
    ) { }

    async generateTaskReportByUser(userId: string, start: Date, end: Date): Promise<Buffer> {
        const startDate = dayjs(start).startOf('day');
        const endDate = dayjs(end).endOf('day');

        const tasks = await this.taskRepository.find({
            relations: ['responsible', 'office', 'created_by', 'category'],
            where: {
                // completed: true,
                dateCulmined: Between(startDate.toDate(), endDate.toDate()),
                responsible: { id: userId },
            },
            order: {
                dateCulmined: 'ASC',
            },
        });

        const workbook = new Workbook();
        const sheet = workbook.addWorksheet('Reporte de Tareas');

        sheet.columns = [
            { header: 'Responsable', key: 'responsible', width: 30 },
            { header: 'Nombre', key: 'name', width: 30 },
            { header: 'Descripción', key: 'description', width: 40 },
            { header: '¿Es Ticket?', key: 'ticket', width: 12 },
            { header: 'Nombre del Ticket', key: 'nameTicket', width: 25 },
            { header: 'Estado', key: 'status', width: 15 },
            { header: 'Oficina', key: 'office', width: 20 },
            { header: 'Fecha de Culminación', key: 'dateCulmined', width: 25 },
            { header: 'Creado por', key: 'created_by', width: 25 },
        ];

        sheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFB8CCE4' },
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        tasks.forEach(task => {
            sheet.addRow({
                responsible: task.responsible.name,
                name: task.name,
                description: task.description,
                ticket: task.ticket ? 'Sí' : 'No',
                nameTicket: task.nameTicket || '',
                status: task.status,
                office: task.office?.name || '—',
                dateCulmined: task.dateCulmined.toLocaleString(),
                created_by: task.created_by?.name || '—',
            });
        });

        sheet.getRow(1).height = 20;

        return await workbook.xlsx.writeBuffer() as Buffer;
    }
}
