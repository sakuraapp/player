import { EventEmitter } from 'events'

export type EventHandlerFn<T extends Event> = (e: T) => void

export interface EventHandler<K, T extends Event = Event> {
    event: K
    handler: EventHandlerFn<T>
}

export interface EventSource<K> {
    addEventListener<T extends Event>(k: K, handler: EventHandlerFn<T>): void
    removeEventListener<T extends Event>(k: K, handler: EventHandlerFn<T>): void
}

export abstract class EventManager<K extends string> extends EventEmitter {
    private eventHandlers: EventHandler<K>[] = []

    protected abstract eventSource?: EventSource<K>
    
    protected addEventListener<T extends Event>(k: K, handler: EventHandlerFn<T>): void {
        this.eventSource.addEventListener(k, handler)
    }

    protected removeEventListener<T extends Event>(k: K, handler: EventHandlerFn<T>): void {
        this.eventSource.addEventListener(k, handler)
    }
    
    protected dispatchEvent<T extends Event>(evtName: string, evt: T): void {
        this.emit(evtName, evt)
    }

    protected bindEvent(evtName: K, newName?: string) {
        if (!newName) {
            newName = evtName
        }

        this.bindEventHandler(evtName, (e) => {
            this.dispatchEvent(newName, e)
        })
    }

    protected bindEventHandler<T extends Event>(evtName: K, handler: EventHandlerFn<T>): EventHandler<K, T> {
        const evtHandler = {
            event: evtName,
            handler,
        }

        this.eventHandlers.push(evtHandler)
        this.addEventListener(evtName, handler)

        return evtHandler
    }

    protected unbindEventHandler<T extends Event>(evtHandler: EventHandler<K, T>, remove = true) {
        this.removeEventListener(
            evtHandler.event,
            evtHandler.handler
        )

        if (remove) {
            const i = this.eventHandlers.indexOf(evtHandler)

            if (i > -1) {
                this.eventHandlers.splice(i, 1)
            }
        }
    }

    protected unbindEventHandlers() {
        for (const evtHandler of this.eventHandlers) {
            this.unbindEventHandler(evtHandler, false)
        }

        this.eventHandlers = []
    }
}
