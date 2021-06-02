type TaskFn = (...args: any[]) => void
type TaskHandlerFn = (stop: TaskFn, time: number) => void

export interface Task {
    resolve: TaskFn
    handle: TaskHandlerFn
}

export class TaskManager {
    public static TICK_RATE = 35

    private tasks: Array<Task> = []
    private timer: number
    private ticks = 0
    
    private createTimer() {
        this.timer = window.setInterval(() => {
            this.ticks++

            const time = this.ticks * TaskManager.TICK_RATE

            for (let i in this.tasks) {
                const task = this.tasks[i]

                task.handle((...args: any[]) => {
                    this.removeTask(Number(i))
                    task.resolve(...args)
                }, time)
            }
        }, TaskManager.TICK_RATE)
    }

    public create<T = any>(fn: TaskHandlerFn): Promise<T> {
        return new Promise((resolve) => {
            this.tasks.push({
                resolve,
                handle: fn,
            })

            if (!this.timer) {
                this.createTimer()
            }
        })
    }

    public removeTask(index: number) {
        this.tasks.splice(index, 1)

        if (this.tasks.length === 0) {
            clearInterval(this.timer)

            this.timer = null
        }
    }

    public destroy() {
        for (let i = 0; i < this.tasks.length; i++) {
            this.removeTask(0)
        }
    }
}

export default new TaskManager
