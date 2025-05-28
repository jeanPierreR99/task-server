import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportExcelService } from 'src/services';

@Controller('report')
export class ReportExcelController {
    constructor(private readonly reportExcelService: ReportExcelService) { }

    @Get('user/:userId')
    async downloadUserTaskReport(
        @Param('userId') userId: string,
        @Query('start') start: string,
        @Query('end') end: string,
        @Res() res: Response,
    ) {
        if (!start || !end) {
            return res.status(400).json({ message: 'Debe enviar start y end como query params' });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        const excelBuffer = await this.reportExcelService.generateTaskReportByUser(
            userId,
            startDate,
            endDate,
        );

        res.set({
            'Content-Type':
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=ReporteTareas_${userId}_${startDate.toISOString().slice(0, 10)}_to_${endDate.toISOString().slice(0, 10)}.xlsx`,
            'Content-Length': excelBuffer.length,
        });

        res.send(excelBuffer);
    }
}
