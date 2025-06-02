import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from 'src/services';

@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    @Get('project-excel/:projectId')
    async downloadUserTaskReport(
        @Param('projectId') projectId: string,
        @Query('start') start: string,
        @Query('end') end: string,
        @Res() res: Response,
    ) {
        if (!start || !end) {
            return res.status(400).json({ message: 'Debe enviar start y end como query params' });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        const excelBuffer = await this.reportService.generateTaskReportByProject(
            projectId,
            startDate,
            endDate,
        );

        res.set({
            'Content-Type':
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=ReporteTareas_${projectId}_${startDate.toISOString().slice(0, 10)}_to_${endDate.toISOString().slice(0, 10)}.xlsx`,
            'Content-Length': excelBuffer.length,
        });

        res.send(excelBuffer);
    }

    @Get('user-pdf/:userId')
    async getTaskReportPdf(
        @Param('userId') userId: string,
        @Query('start') start: string,
        @Query('end') end: string,
        @Res() res: Response,
    ) {
        const startDate = start ? new Date(start) : new Date();
        const endDate = end ? new Date(end) : new Date();

        const pdfBuffer = await this.reportService.generateTaskReportWithTemplate(userId, startDate, endDate);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="task-report-${userId}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
    }

}
