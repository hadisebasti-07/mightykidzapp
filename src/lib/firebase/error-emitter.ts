// A simple, dependency-free event emitter.
type Listener = (event: any) => void;

class EventEmitter {
  private listeners: { [key: string]: Listener[] } = {};

  on(eventName: string, listener: Listener) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listener);
  }

  emit(eventName: string, data: any) {
    const eventListeners = this.listeners[eventName];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }
}

export const errorEmitter = new EventEmitter();
