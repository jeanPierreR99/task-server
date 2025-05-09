import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private project: Record<string, Socket[]> = {};

    handleConnection(socket: Socket) {
        socket.on('joinTaskProject', (projectId: string) => {
            if (!this.project[projectId]) {
                this.project[projectId] = [];
            }
            this.project[projectId].push(socket);
            console.log(`Socket de tareas ${socket.id} joined task project ${projectId}`);
        });
    }

    handleDisconnect(socket: Socket) {
        for (let projectId in this.project) {
            this.project[projectId] = this.project[projectId].filter(s => s.id !== socket.id);
        }
        console.log(`Socket ${socket.id} disconnected`);
    }

    @SubscribeMessage('newTaskProject')
    async newTask(@MessageBody() data: any) {
        const { projectId, task } = data;

        if (this.project[projectId] && this.project[projectId].length > 0) {
            this.project[projectId].forEach(socket => {
                socket.emit('updateTaskProject', { projectId, task });
            });
            console.log(`New task sent to project ${projectId}`);
        } else {
            console.log(`No sockets connected to project ${projectId}`);
        }
    }

    @SubscribeMessage('newCategoryProject')
    async newCategory(@MessageBody() data: any) {
        const { projectId, category } = data;

        if (this.project[projectId] && this.project[projectId].length > 0) {
            this.project[projectId].forEach(socket => {
                socket.emit('updateCategoryProject', { projectId, category });
            });
            console.log(`New category sent to project ${projectId}`);
        } else {
            console.log(`No sockets connected to project ${projectId}`);
        }
    }
    @SubscribeMessage('deleteCategoryProjectId')
    async deleteCategory(@MessageBody() data: any) {
        const { projectId, category } = data;
        console.log(category)
        if (this.project[projectId] && this.project[projectId].length > 0) {
            this.project[projectId].forEach(socket => {
                socket.emit('deleteCategoryProject', { projectId, category });
            });
            console.log(`delete category to project ${projectId}`);
        } else {
            console.log(`No sockets connected to project ${projectId}`);
        }
    }

    @SubscribeMessage('updateCategoryTaskProjectId')
    async updateTaskCategory(@MessageBody() data: any) {
        const { projectId, task } = data;
        if (this.project[projectId] && this.project[projectId].length > 0) {
            this.project[projectId].forEach(socket => {
                socket.emit('updateCategoryTaskProject', { projectId, task });
            });
            console.log(`update category task to project ${projectId}`);
        } else {
            console.log(`No sockets connected to project ${projectId}`);
        }
    }

    @SubscribeMessage('deleteTaskProjectId')
    async deleteTaskProject(@MessageBody() data: any) {
        const { projectId, task } = data;
        if (this.project[projectId] && this.project[projectId].length > 0) {
            this.project[projectId].forEach(socket => {
                socket.emit('deleteTaskProject', { projectId, task });
            });
            console.log(`update category task to project ${projectId}`);
        } else {
            console.log(`No sockets connected to project ${projectId}`);
        }
    }
}
