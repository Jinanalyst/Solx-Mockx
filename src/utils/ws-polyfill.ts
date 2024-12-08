import WebSocket from 'isomorphic-ws';

type WebSocketData = string | ArrayBuffer | Buffer | Buffer[] | DataView;

// Create a WebSocket wrapper that implements the rpc-websockets interface
export class CustomWebSocket {
  private ws: WebSocket;
  public onclose: ((event: WebSocket.CloseEvent) => void) | null = null;
  public onerror: ((event: WebSocket.ErrorEvent) => void) | null = null;
  public onmessage: ((event: WebSocket.MessageEvent) => void) | null = null;
  public onopen: ((event: WebSocket.Event) => void) | null = null;

  constructor(url: string, protocols?: string | string[]) {
    this.ws = new WebSocket(url, protocols);
    
    this.ws.onclose = (event) => this.onclose?.(event);
    this.ws.onerror = (event) => this.onerror?.(event);
    this.ws.onmessage = (event) => this.onmessage?.(event);
    this.ws.onopen = (event) => this.onopen?.(event);
  }

  get readyState(): number {
    return this.ws.readyState;
  }

  close(code?: number, reason?: string): void {
    this.ws.close(code, reason);
  }

  send(data: WebSocketData): void {
    this.ws.send(data);
  }

  removeAllListeners(): void {
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;
    this.onopen = null;
  }

  terminate(): void {
    this.close();
  }
}

// Create a mock Client class that matches rpc-websockets interface
export class Client {
  private ws: CustomWebSocket;
  
  constructor(address: string, options: any = {}) {
    this.ws = new CustomWebSocket(address);
  }

  close(): void {
    this.ws.close();
  }

  on(event: string, callback: (data: any) => void): void {
    switch (event) {
      case 'open':
        this.ws.onopen = callback;
        break;
      case 'close':
        this.ws.onclose = callback;
        break;
      case 'error':
        this.ws.onerror = callback;
        break;
      case 'message':
        this.ws.onmessage = callback;
        break;
    }
  }

  send(data: any): void {
    if (typeof data === 'object') {
      this.ws.send(JSON.stringify(data));
    } else {
      this.ws.send(data);
    }
  }
}

// Export the custom WebSocket implementation
export { CustomWebSocket as WebSocket };
