class LiveWebSocket {
  constructor() {
    this.ws = null;
    this.subscribers = new Set();
    this.activeSymbol = null;
  }

  connect() {
    // Vite proxy handles WS implicitly on the same port
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/quotes`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WS Connected');
      if (this.activeSymbol) {
        this.subscribe(this.activeSymbol);
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.subscribers.forEach(cb => cb(data));
      } catch (err) {
        console.error("WS Parse error", err);
      }
    };

    this.ws.onclose = () => {
      console.log('WS Disconnected. Reconnecting...');
      setTimeout(() => this.connect(), 3000);
    };
  }

  subscribe(symbol) {
    this.activeSymbol = symbol;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'subscribe', symbol }));
    }
  }

  onMessage(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
}

export const wsService = new LiveWebSocket();
export default wsService;
