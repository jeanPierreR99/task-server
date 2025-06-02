import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Task } from 'src/entities/task.entity';
import * as dayjs from "dayjs"
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
    ) { }

    async generateTaskReportByProject(projectId: string, start: Date, end: Date): Promise<Buffer> {
        const startDate = dayjs(start).startOf('day');
        const endDate = dayjs(end).endOf('day');

        const tasks = await this.taskRepository.find({
            relations: ['responsible', 'office', 'created_by', 'category'],
            where: {
                category: { project: { id: projectId } },
                dateCulmined: Between(startDate.toDate(), endDate.toDate()),
            },
            order: {
                dateCulmined: 'ASC',
            },
        });

        const workbook = new Workbook();
        const sheet = workbook.addWorksheet('Reporte de Tareas');

        sheet.columns = [
            { header: 'Responsable', key: 'responsible', width: 25 },
            { header: 'Tarea', key: 'task', width: 35 },
            { header: 'Descripción', key: 'description', width: 40 },
            { header: '¿Es Ticket?', key: 'ticket', width: 12 },
            { header: 'Nombre del Ticket', key: 'nameTicket', width: 25 },
            { header: 'Estado', key: 'status', width: 15 },
            { header: 'Oficina', key: 'office', width: 40 },
            { header: 'Fecha de Entrega o Atendida', key: 'dateCulmined', width: 25 },
            { header: 'Creado por', key: 'created_by', width: 25 },
        ];

        sheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFB8CCE4' },
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        });
        sheet.getRow(1).height = 30;

        tasks.forEach(task => {
            const row = sheet.addRow({
                dateCulmined: task.dateCulmined.toLocaleDateString(),
                responsible: task.responsible?.name ?? '—',
                task: task.name,
                description: task.description,
                ticket: task.ticket ? 'Sí' : 'No',
                nameTicket: task.nameTicket || '',
                status: task.status,
                office: task.office?.name || '—',
                created_by: task.created_by?.name || '—',
            });

            row.eachCell(cell => {
                cell.alignment = { wrapText: true, vertical: 'middle' };
            });

            row.height = 40;
        });

        return await workbook.xlsx.writeBuffer() as Buffer;
    }


    async generateTaskReportWithTemplate(userId: string, start: Date, end: Date): Promise<Buffer> {
        const startDate = dayjs(start).startOf('day');
        const endDate = dayjs(end).endOf('day');

        const tasks = await this.taskRepository.find({
            relations: ['responsible', 'office', 'created_by', 'category'],
            where: {
                dateCulmined: Between(startDate.toDate(), endDate.toDate()),
                responsible: { id: userId },
            },
            order: { dateCulmined: 'DESC' },
        });

        const templatePath = path.resolve('static/doc/template.pdf');
        const templateBytes = fs.readFileSync(templatePath);

        const templatePdf = await PDFDocument.load(templateBytes);
        const pdfDoc = await PDFDocument.create();

        let [templatePage] = await pdfDoc.copyPages(templatePdf, [0]);
        let currentPage = templatePage;
        pdfDoc.addPage(currentPage);

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontTitle = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let { width, height } = currentPage.getSize();

        const marginX = 40;
        const gapX = 20;
        const cardWidth = (width - marginX * 2 - gapX) / 2;
        const cardHeight = 100;
        const gapY = 20;
        const maxRowsPerPage = 5;

        const name = `${tasks[0]?.responsible.name || '________'}`;
        const email = `${tasks[0]?.responsible.email || '________'}`;
        const telephone = `${tasks[0]?.responsible.telephone || '________'}`;

        const formatter = new Intl.DateTimeFormat('es-PE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        const startFormatted = formatter.format(new Date(start));
        const endFormatted = formatter.format(new Date(end));

        const joinDate = `Reporte del ${startFormatted} al ${endFormatted}`;

        let userImage: any;
        const relativeImagePath = tasks[0]?.responsible.imageUrl?.replace('/uploads/', '');
        const imagePath = path.resolve('uploads', relativeImagePath || '');
        if (relativeImagePath && fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            try {
                userImage = await pdfDoc.embedJpg(imageBuffer);
            } catch (e) {
                console.warn('No se pudo embeber la imagen del usuario:', e);
            }
        }

        function drawHeader(page: PDFPage) {
            const nameY = height - 160;
            const imageSize = 40;
            const imageX = 40;
            const nameX = imageX + imageSize + 10;

            if (userImage) {
                page.drawImage(userImage, {
                    x: imageX,
                    y: nameY - 5,
                    width: imageSize,
                    height: imageSize,
                });
            }

            page.drawText(name, {
                x: nameX,
                y: nameY + 28,
                size: 10,
                font: fontTitle,
                color: rgb(0, 0, 0),
            });

            page.drawText(email, {
                x: nameX,
                y: nameY + 14,
                size: 10,
                font: fontTitle,
                color: rgb(0, 0, 1),
            });

            page.drawText(telephone, {
                x: nameX,
                y: nameY + 0,
                size: 10,
                font: fontTitle,
                color: rgb(0, 0, 0),
            });

            const textWidth = font.widthOfTextAtSize(joinDate, 8);
            const rightX = width - textWidth - 40;

            page.drawText(joinDate, {
                x: rightX,
                y: height - 120,
                size: 8,
                font,
                color: rgb(0, 0, 0),
            });
        }

        drawHeader(currentPage);

        let currentY = height - 280;
        let currentRow = 0;

        function drawWrappedText(
            text: string,
            x: number,
            startY: number,
            fontSize: number,
            lineHeight: number,
            page: PDFPage,
            maxWidth: number,
            font: PDFFont,
            maxLines = 2
        ) {
            const words = text.split(' ');
            let lines: string[] = [];
            let line = '';

            for (let i = 0; i < words.length; i++) {
                const testLine = line ? line + ' ' + words[i] : words[i];
                const testWidth = font.widthOfTextAtSize(testLine, fontSize);

                if (testWidth > maxWidth) {

                    if (lines.length === maxLines - 1) {
                        let truncatedLine = line;

                        while (font.widthOfTextAtSize(truncatedLine + '...', fontSize) > maxWidth && truncatedLine.length > 0) {
                            truncatedLine = truncatedLine.slice(0, -1);
                        }
                        lines.push(truncatedLine + '...');
                        break;
                    } else {
                        lines.push(line);
                        line = words[i];
                    }
                } else {
                    line = testLine;
                }
            }

            if (lines.length < maxLines && line) {
                lines.push(line);
            }

            // Dibujar las líneas
            let y = startY;
            lines.forEach((ln) => {
                page.drawText(ln, {
                    x,
                    y,
                    size: fontSize,
                    font,
                    color: rgb(0, 0, 0),
                });
                y -= lineHeight;
            });
        }

        0
        for (let idx = 0; idx < tasks.length; idx++) {
            const task = tasks[idx];

            if (idx > 0 && idx % (maxRowsPerPage * 2) === 0) {
                const [newPage] = await pdfDoc.copyPages(templatePdf, [0]);
                currentPage = newPage;
                pdfDoc.addPage(currentPage);
                ({ width, height } = currentPage.getSize());
                drawHeader(currentPage);
                currentY = height - 160;
                currentRow = 0;
            }

            if (idx % 2 === 0 && idx !== 0) {
                currentY -= cardHeight + gapY;
                currentRow++;
            }

            const isLeft = idx % 2 === 0;
            const x = isLeft ? marginX : marginX + cardWidth + gapX;

            currentPage.drawRectangle({
                x,
                y: currentY,
                width: cardWidth,
                height: cardHeight,
                borderColor: rgb(0.65, 0.65, 0.65),
                borderWidth: 0.5,
                color: rgb(0.95, 0.95, 0.95),
            });

            const startTextY = currentY + cardHeight - 20;
            let textY = startTextY;

            drawWrappedText(`TAREA: ${task.name}`, x + 10, textY, 9, 12, currentPage, cardWidth - 20, font, 2);
            textY -= 24;

            drawWrappedText(`DESCRIPCIÒN: ${task.description}`, x + 10, textY, 9, 12, currentPage, cardWidth - 20, font, 2);
            textY -= 24;


            const otherLines = [
                `ESTADO: ${task.status}`,
                `ES TICKET?: ${task.ticket ? 'Sí' : 'No'}`,
                `FECHA DE ENTREGA O ATENDIDA: ${task.dateCulmined.toLocaleDateString()}`,
            ];

            otherLines.forEach((line, i) => {
                currentPage.drawText(line, {
                    x: x + 10,
                    y: textY - i * 12,
                    size: 9,
                    font,
                    color: rgb(0, 0, 0),
                });
            });
        }

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }
}