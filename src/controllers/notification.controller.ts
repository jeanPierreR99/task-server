import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from 'src/services/notification.service';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Post('subscribe')
    subscribe(@Body() body: any) {
        console.log(body)
        return this.notificationService.subscribe(body);
    }

    @Post('send')
    send(@Body() body: { title: string; message: string }) {
        return this.notificationService.sendNotification(
            body.title,
            body.message,
        );
    }
}
