import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from 'src/services/dashboard.service';

@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
    ) { }

    @Get('/:userId')
    async getTotals(@Param('userId') userId: string) {
        return this.dashboardService.getTotals(userId);
    }

    @Get('user/:userId/complete')
    async getChartDataUserComplete(@Param('userId') userId: string) {
        return this.dashboardService.getChartDataUserComplete(userId);
    }

    @Get('user/:userId/pending')
    async getChartDataUserPending(@Param('userId') userId: string) {
        return this.dashboardService.getChartDataUserPending(userId);
    }
}