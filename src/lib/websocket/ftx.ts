type WebSocketMessage = {
  channel: string;
  market: string;
  type: 'subscribe' | 'unsubscribe' | 'update' | 'partial' | 'error';
  data?: any;
};

type Subscription = {
  channel: string;
  market: string;
};

type MessageHandler = (data: any) => void;

export class FTXWebSocket {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(private endpoint = 'wss://ftx.us/ws/') {
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.endpoint);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

      // Setup ping interval
      this.pingInterval = setInterval(() => {
        this.ping();
      }, 15000);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleClose();
    }
  }

  private handleOpen() {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    
    // Resubscribe to all channels
    for (const [key, handlers] of this.subscriptions) {
      const [channel, market] = key.split(':');
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          op: 'subscribe',
          channel,
          market
        }));
      }
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      if (message.type === 'error') {
        console.error('WebSocket error:', message.data);
        return;
      }

      if (message.type === 'pong') {
        return;
      }

      const key = `${message.channel}:${message.market}`;
      const handlers = this.subscriptions.get(key);
      
      if (handlers) {
        handlers.forEach(handler => handler(message.data));
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private handleClose() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts + 1}`);
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleError(error: Event) {
    console.error('WebSocket error:', error);
  }

  private ping() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ op: 'ping' }));
    }
  }

  private getSubscriptionKey(channel: string, market: string): string {
    return `${channel}:${market}`;
  }

  subscribe(channel: string, market: string, handler: MessageHandler) {
    const key = this.getSubscriptionKey(channel, market);
    
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    
    this.subscriptions.get(key)?.add(handler);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        op: 'subscribe',
        channel,
        market
      }));
    }
  }

  unsubscribe(channel: string, market: string, handler: MessageHandler) {
    const key = this.getSubscriptionKey(channel, market);
    const handlers = this.subscriptions.get(key);
    
    if (handlers) {
      handlers.delete(handler);
      
      if (handlers.size === 0) {
        this.subscriptions.delete(key);
        
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            op: 'unsubscribe',
            channel,
            market
          }));
        }
      }
    }
  }

  disconnect() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.subscriptions.clear();
  }
}

// Singleton instance
let wsInstance: FTXWebSocket | null = null;

export const getFTXWebSocket = () => {
  if (!wsInstance) {
    wsInstance = new FTXWebSocket();
  }
  return wsInstance;
};
