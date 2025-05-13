// src/push/push.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notification.entity';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private subscriptionRepo: Repository<Notification>,
        private readonly configService: ConfigService

    ) {
        webpush.setVapidDetails(
            'mailto:asana.munitamboapta.gob.pe',
            this.configService.get<string>('VAPID_PUBLIC_KEY'),
            this.configService.get<string>('VAPID_PRIVATE_KEY')
        );
    }

    async subscribe(subscription: any) {
        const { endpoint, keys } = subscription;

        const exists = await this.subscriptionRepo.findOne({ where: { endpoint } });
        if (!exists) {
            const newSub = this.subscriptionRepo.create({
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
            });
            await this.subscriptionRepo.save(newSub);
        }
        return { message: 'Suscripción guardada' };
    }

    async sendNotification(title: string, message: string) {
        const subs = await this.subscriptionRepo.find();

        for (const sub of subs) {
            const subscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            const payload = JSON.stringify({
                title,
                body: message,
                image: 'https://via.placeholder.com/800x400.png?text=Notificación',
                url: 'https://asana.munitambopata.gob.pe:85/all-tickets',
            });

            try {
                await webpush.sendNotification(subscription, payload);
            } catch (err) {
                console.error('Error enviando notificación:', err);
            }
        }

        return { message: 'Notificaciones enviadas' };
    }

}
