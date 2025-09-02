import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinDuel(duelId: string) {
    this.socket?.emit('join-duel', duelId);
  }

  leaveDuel(duelId: string) {
    this.socket?.emit('leave-duel', duelId);
  }

  submitCode(duelId: string, code: string) {
    this.socket?.emit('submit-code', { duelId, code });
  }

  onDuelUpdate(callback: (data: any) => void) {
    this.socket?.on('duel-update', callback);
  }

  onPlayerJoined(callback: (data: any) => void) {
    this.socket?.on('player-joined', callback);
  }

  onCodeUpdate(callback: (data: any) => void) {
    this.socket?.on('code-update', callback);
  }

  onDuelComplete(callback: (data: any) => void) {
    this.socket?.on('duel-complete', callback);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();