import { WebSocket as WSWebSocket } from 'ws';
import WebSocket from 'isomorphic-ws';

export class CustomWebSocketProvider {
  private static instance: typeof WebSocket | typeof WSWebSocket;

  public static getWebSocket(): typeof WebSocket | typeof WSWebSocket {
    if (!CustomWebSocketProvider.instance) {
      CustomWebSocketProvider.instance = typeof window !== 'undefined' ? WebSocket : WSWebSocket;
    }
    return CustomWebSocketProvider.instance;
  }
}
