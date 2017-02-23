class eventSystem {
    constructor() {
        this.listeners = new Map;
    }
    hasListener(type, func) {
        return this.listeners.has(type) && this.listeners.get(type).has(func);
    }
    addListener(type, func) {
        if (!this.listeners.has(type)) this.listeners.set(type, new Set);
        this.listeners.get(type).add(func);
    }
    removeListener(type, func) {
        if (this.listeners.has(type)) {
            const typeGroup = this.listeners.get(type);
            if (typeGroup.has(func)) typeGroup.delete(func);
            if (typeGroup.size == 0) this.listeners.delete(type);
        }
    }
    makeHandle(type, func) {
        const eventsys = this;
        return {
            off() {
                eventsys.off(type, func);
                return this;
            },
            on() {
                this.off();
                eventsys.on(type, func);
                return this;
            },
            once() {
                eventsys.once(type, func);
                return this;
            }
        }
    }
    on(type, func) {
        this.addListener(type, func);
        return this.makeHandle(type, func);
    }
    once(type, func) {
        if (this.hasListener(type, func)) this.removeListener(type, func);
        const wrap = (...args) => {
            func(...args);
            this.removeListener(type, wrap);
        }
        this.addListener(type, wrap);
        return this.makeHandle(type, func);
    }
    off(type, func) {
        this.removeListener(type, func);
        return this.makeHandle(type, func);
    }
    emit(type, ...args) {
        if (this.listeners.has(type)) {
            const typeGroup = this.listeners.get(type);
            typeGroup.forEach(Listener => {
                Listener(...args);
            })
        }
    }
}
