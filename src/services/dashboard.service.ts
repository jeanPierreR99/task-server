import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import * as dayjs from "dayjs"
import { Task } from "src/entities"
import { Between, Repository } from "typeorm"

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
    ) { }

    async getChartDataUserComplete(userId: string) {
        const today = dayjs()
        const dayOfWeek = today.day()
        const startOfWeek = today
            .subtract(dayOfWeek === 0 ? 6 : dayOfWeek - 1, "day")
            .startOf("day")
        const endOfWeek = startOfWeek.add(6, "day").endOf("day")

        const result: Record<string, { task: number; ticket: number }> = {}

        for (let i = 0; i < 7; i++) {
            const date = startOfWeek.add(i, "day").toDate().toISOString()
            result[date] = { task: 0, ticket: 0 }
        }

        const allTasks = await this.taskRepository.find({
            where: {
                dateCulmined: Between(startOfWeek.toDate(), endOfWeek.toDate()),
                completed: true,
                responsible: { id: userId },
            },
        })

        for (const task of allTasks) {
            const date = dayjs(task.dateCulmined).startOf("day").toDate().toISOString()
            if (!result[date]) continue

            if (task.ticket) {
                result[date].ticket++
            } else {
                result[date].task++
            }
        }

        return {
            data: allTasks,
            chart: Object.entries(result).map(([date, value]) => ({
                date,
                ...value,
            })),
        }
    }

    async getChartDataUserPending(userId: string) {
        const today = dayjs()
        const dayOfWeek = today.day()
        const startOfWeek = today
            .subtract(dayOfWeek === 0 ? 6 : dayOfWeek - 1, "day")
            .startOf("day")
        const endOfWeek = startOfWeek.add(6, "day").endOf("day")

        const result: Record<string, { task: number; ticket: number }> = {}

        for (let i = 0; i < 7; i++) {
            const date = startOfWeek.add(i, "day").toDate().toISOString()
            result[date] = { task: 0, ticket: 0 }
        }

        const allTasks = await this.taskRepository.find({
            where: {
                dateCulmined: Between(startOfWeek.toDate(), endOfWeek.toDate()),
                completed: false,
                responsible: { id: userId },
            },
        })

        for (const task of allTasks) {
            const date = dayjs(task.dateCulmined).startOf("day").toDate().toISOString()
            if (!result[date]) continue

            if (task.ticket) {
                result[date].ticket++
            } else {
                result[date].task++
            }
        }

        return {
            data: allTasks,
            chart: Object.entries(result).map(([date, value]) => ({
                date,
                ...value,
            })),
        }
    }

    async getTotals(userId: string) {
        const tasks = await this.taskRepository.find({
            where: {
                responsible: { id: userId },
            },
        })

        let taskCompleted = 0
        let taskPending = 0
        let ticketCompleted = 0
        let ticketPending = 0

        for (const task of tasks) {
            if (task.ticket) {
                if (task.completed) ticketCompleted++
                else ticketPending++
            } else {
                if (task.completed) taskCompleted++
                else taskPending++
            }
        }

        return {
            taskCompleted,
            taskPending,
            ticketCompleted,
            ticketPending,
        }
    }

    async getChartDataUserCompleteByRange(userId: string, start: Date, end: Date) {
        const startDate = dayjs(start).startOf("day")
        const endDate = dayjs(end).endOf("day")

        const result: Record<string, { task: number; ticket: number }> = {}

        const diffDays = endDate.diff(startDate, "day")

        for (let i = 0; i <= diffDays; i++) {
            const currentDate = startDate.add(i, "day").toDate().toISOString()
            result[currentDate] = { task: 0, ticket: 0 }
        }

        const tasks = await this.taskRepository.find({
            where: {
                completed: true,
                dateCulmined: Between(startDate.toDate(), endDate.toDate()),
                responsible: { id: userId },
            },
            order: {
                dateCulmined: "ASC",
            },
            select: {
                name: true,
                ticket: true,
                dateCulmined: true,
            },
        })

        for (const task of tasks) {
            const dateKey = dayjs(task.dateCulmined).startOf("day").toDate().toISOString()
            if (!result[dateKey]) continue

            if (task.ticket) {
                result[dateKey].ticket++
            } else {
                result[dateKey].task++
            }
        }

        return {
            chart: Object.entries(result).map(([date, value]) => ({
                date,
                ...value,
            })),
            data: tasks.map(task => ({
                name: task.name,
                ticket: task.ticket,
                dateCulmined: task.dateCulmined.toISOString(),
            })),
        }
    }
}
