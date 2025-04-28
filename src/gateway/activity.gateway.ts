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
export class ActivityGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log(`Socket de actividades ${socket.id} connected`);

  }

  handleDisconnect(socket: Socket) {
    console.log(`Socket ${socket.id} disconnected`);
  }

  @SubscribeMessage('newActivity')
  async newActivity(@MessageBody() activity: any) {
    this.server.emit('updateActivity', activity);
  }
}
