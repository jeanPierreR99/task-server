import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class CommentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private users: Record<string, Socket[]> = {};

  handleConnection(socket: Socket) {
    socket.on('joinTask', (taskId: string) => {
      if (!this.users[taskId]) {
        this.users[taskId] = [];
      }
      this.users[taskId].push(socket);
      console.log(`Socket de comentarios ${socket.id} joined task ${taskId}`);
    });
  }

  handleDisconnect(socket: Socket) {
    for (let taskId in this.users) {
      this.users[taskId] = this.users[taskId].filter(s => s.id !== socket.id);
    }
    console.log(`Socket ${socket.id} disconnected`);
  }

  @SubscribeMessage('newComment')
  async newComment(@MessageBody() commentData: any) {
    const { taskId, comment } = commentData;

    if (this.users[taskId]) {
      this.users[taskId].forEach(socket => {
        socket.emit('updateComments', { taskId, comment });
      });
    }
  }
}
