import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class TicketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(socket: Socket) {
        console.log(`Socket de tickets global ${socket.id} connected`);
    }

    handleDisconnect(socket: Socket) {
        console.log(`Socket ${socket.id} disconnected`);
    }

    @SubscribeMessage('newTicket')
    async newTicket(@MessageBody() ticket: any) {
        this.server.emit('updateTicket', ticket);
    }

    @SubscribeMessage('newTaskTicket')
    async newTaskTicket(@MessageBody() task: any) {
        this.server.emit('updateTaskTicket', task);
    }
}
