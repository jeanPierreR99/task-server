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
            console.log(`Socket de task global ${socket.id} connected`);
            this.project[projectId].push(socket);
        });
    }

    handleDisconnect(socket: Socket) {
        for (let projectId in this.project) {
            this.project[projectId] = this.project[projectId].filter(s => s.id !== socket.id);
        }
    }

    @SubscribeMessage('newTaskProject')
    async newTask(@MessageBody() data: any) {
        const { projectId, task } = data;

        if (this.project[projectId] && this.project[projectId].length > 0) {
            this.project[projectId].forEach(socket => {
                socket.emit('updateTaskProject', { projectId, task });
            });
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
        } else {
            console.log(`No sockets connected to project ${projectId}`);
        }
    }

    @SubscribeMessage('updateTaskStatusProjectId')
    async updateTaskStatusProject(@MessageBody() data: any) {
        const { projectId, task } = data;
        if (this.project[projectId] && this.project[projectId].length > 0) {
            this.project[projectId].forEach(socket => {
                socket.emit('updateTaskStatusProject', { projectId, task });
            });
        } else {
            console.log(`No sockets connected to project ${projectId}`);
        }
    }

    @SubscribeMessage('updateTaskDateProjectId')
    async updateTaskDateProject(@MessageBody() data: any) {
        const { projectId, task } = data;
        if (this.project[projectId] && this.project[projectId].length > 0) {
            this.project[projectId].forEach(socket => {
                socket.emit('updateTaskDateProject', { projectId, task });
            });
        } else {
            console.log(`No sockets connected to project ${projectId}`);
        }
    }
}
