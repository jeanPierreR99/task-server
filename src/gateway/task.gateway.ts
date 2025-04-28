import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private users: Record<string, Socket[]> = {};

    handleConnection(socket: Socket) {
        socket.on('joinTaskAsigned', (userId: string) => {
            if (!this.users[userId]) {
                this.users[userId] = [];
            }
            this.users[userId].push(socket);
            console.log(`Socket de tareas ${socket.id} joined task asigned ${userId}`);
        });
    }

    handleDisconnect(socket: Socket) {
        for (let userId in this.users) {
            this.users[userId] = this.users[userId].filter(s => s.id !== socket.id);
        }
        console.log(`Socket ${socket.id} disconnected`);
    }

    @SubscribeMessage('newTaskAsigned')
    async newTaskAsigned(@MessageBody() data: any) {
        const { userId, task } = data;

        if (this.users[userId]) {
            this.users[userId].forEach(socket => {
                socket.emit('updateTaskAsigned', { userId, task });
            });
        }
    }
}
