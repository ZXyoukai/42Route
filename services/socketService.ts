import { io, Socket } from 'socket.io-client';
import { ENV_CONFIG, SOCKET_URL } from '../config/environment';

// ─── Types ────────────────────────────────────────────────────────────────

export interface DriverLocationPayload {
  id_driver: number;
  lat: number;
  long: number;
  routeId: number;
  driverName: string | null;
}

export interface TransportLocationPayload {
  cadeteId: number;
  lat: number;
  long: number;
  source: 'cadete';
  routeId: number;
  cadeteName: string | null;
}

export type LocationPayload = DriverLocationPayload | TransportLocationPayload;

export interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  senderType: number; // 0 = CADETE, 1 = DRIVER, 2 = ADMIN
  content: string;
  createdAt: string;
}

// ─── Singleton socket ─────────────────────────────────────────────────────

let _socket: Socket | null = null;
let _reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000; // 3 seconds

// State listeners to track connection status
let _connectionStatusListeners: ((connected: boolean) => void)[] = [];

function getSocket(): Socket {
  if (!_socket || !_socket.connected) {
    const baseUrl = (SOCKET_URL?.trim() || 'http://127.0.0.1:3000').replace(/\/$/, '');

    console.log(`[SocketService] 🔌 Inicializando Socket.IO em ${baseUrl}`);

    _socket = io(baseUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: RECONNECT_INTERVAL,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    });

    // Connection events
    _socket.on('connect', () => {
      console.log(`[SocketService] 🟢 Socket conectado: ${_socket?.id}`);
      _reconnectAttempts = 0;
      _connectionStatusListeners.forEach(listener => listener(true));
    });

    _socket.on('disconnect', (reason) => {
      console.log(`[SocketService] 🔴 Socket desconectado. Motivo: ${reason}`);
      _connectionStatusListeners.forEach(listener => listener(false));
    });

    _socket.on('connect_error', (err) => {
      console.warn(`[SocketService] ⚠️ Erro de conexão:`, err.message);
      _reconnectAttempts++;
    });

    _socket.on('reconnect_attempt', () => {
      console.log(`[SocketService] 🔄 Tentativa de reconexão ${_reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}`);
    });

    _socket.on('reconnect', () => {
      console.log(`[SocketService] ✅ Reconectado com sucesso!`);
      _reconnectAttempts = 0;
    });

    _socket.on('reconnect_failed', () => {
      console.error(`[SocketService] ❌ Falha na reconexão após ${MAX_RECONNECT_ATTEMPTS} tentativas`);
    });
  }
  return _socket;
}

function disconnect() {
  if (_socket) {
    console.log(`[SocketService] 🧹 Desconectando Socket`);
    _socket.disconnect();
    _socket = null;
    _reconnectAttempts = 0;
  }
}

// ─── Connection Status Tracking ────────────────────────────────────────────

function onConnectionChange(callback: (connected: boolean) => void) {
  _connectionStatusListeners.push(callback);
}

function offConnectionChange(callback: (connected: boolean) => void) {
  _connectionStatusListeners = _connectionStatusListeners.filter(l => l !== callback);
}

function isConnected(): boolean {
  return _socket?.connected ?? false;
}

// ─── Location events ──────────────────────────────────────────────────────

/** Motorista entra no room da sua rota */
function driverJoinRoute(driverId: number) {
  console.log(`[SocketService] 🚗 Driver ${driverId} joining route`);
  getSocket().emit('driver:joinRoute', { driverId });
}

/** Motorista sai do room da sua rota */
function driverLeaveRoute(driverId: number) {
  console.log(`[SocketService] 🚗 Driver ${driverId} leaving route`);
  getSocket().emit('driver:leaveRoute', { driverId });
}

/** Cadete entra no room da sua rota */
function cadeteJoinRoute(cadeteId: number) {
  console.log(`[SocketService] 👤 Cadete ${cadeteId} joining route`);
  getSocket().emit('cadete:joinRoute', { cadeteId });
}

/** Cadete sai do room da sua rota */
function cadeteLeaveRoute(cadeteId: number) {
  console.log(`[SocketService] 👤 Cadete ${cadeteId} leaving route`);
  getSocket().emit('cadete:leaveRoute', { cadeteId });
}

/** Motorista emite a sua localização */
function driverUpdateLocation(id_driver: number, lat: number, long_: number) {
  console.log(`[SocketService] 📍 Driver location: ${lat}, ${long_}`);
  getSocket().emit('driver:updateLocation', { id_driver, lat, long: long_ });
}

/** Cadete emite a sua localização (fallback quando motorista inativo) */
function cadeteUpdateLocation(cadeteId: number, lat: number, long_: number) {
  console.log(`[SocketService] 📍 Cadete location: ${lat}, ${long_}`);
  getSocket().emit('cadete:updateLocation', { cadeteId, lat, long: long_ });
}

/** Ouve a posição do motorista (cadetes e motorista) */
function onDriverLocation(cb: (payload: DriverLocationPayload) => void) {
  getSocket().on('driver:location', cb);
  console.log(`[SocketService] 📡 Listener added: driver:location`);
}

/** Ouve a posição do transporte quando enviada por um cadete */
function onTransportLocation(cb: (payload: TransportLocationPayload) => void) {
  getSocket().on('transport:location', cb);
  console.log(`[SocketService] 📡 Listener added: transport:location`);
}

function offDriverLocation(cb?: (payload: DriverLocationPayload) => void) {
  if (cb) {
    getSocket().off('driver:location', cb);
    console.log(`[SocketService] 🧹 Listener removed: driver:location (specific)`);
  } else {
    getSocket().off('driver:location');
    console.log(`[SocketService] 🧹 Listener removed: driver:location (all)`);
  }
}

function offTransportLocation(cb?: (payload: TransportLocationPayload) => void) {
  if (cb) {
    getSocket().off('transport:location', cb);
    console.log(`[SocketService] 🧹 Listener removed: transport:location (specific)`);
  } else {
    getSocket().off('transport:location');
    console.log(`[SocketService] 🧹 Listener removed: transport:location (all)`);
  }
}

// ─── Chat events ──────────────────────────────────────────────────────────

/** Entrar numa sala de chat */
function joinChat(type: 'GENERAL' | 'ROUTE', routeId?: number) {
  console.log(`[SocketService] 💬 Joining ${type} chat${routeId ? ` for route ${routeId}` : ''}`);
  getSocket().emit('join:chat', { type, routeId });
}

/** Enviar mensagem */
function sendChatMessage(payload: {
  chatId: number;
  content: string;
  senderId: number;
  senderType: number;
  routeId?: number;
  chatType: 'GENERAL' | 'ROUTE';
}) {
  console.log(`[SocketService] 💬 Sending message to chat ${payload.chatId}`);
  getSocket().emit('chat:send', payload);
}

/** Ouvir novas mensagens */
function onNewMessage(cb: (msg: ChatMessage) => void) {
  getSocket().on('chat:new-message', cb);
  console.log(`[SocketService] 📡 Listener added: chat:new-message`);
}

function offNewMessage(cb?: (msg: ChatMessage) => void) {
  if (cb) {
    getSocket().off('chat:new-message', cb);
    console.log(`[SocketService] 🧹 Listener removed: chat:new-message (specific)`);
  } else {
    getSocket().off('chat:new-message');
    console.log(`[SocketService] 🧹 Listener removed: chat:new-message (all)`);
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const socketService = {
  getSocket,
  disconnect,
  isConnected,
  onConnectionChange,
  offConnectionChange,
  // Emit generic event
  emit: (event: string, data?: any) => {
    getSocket().emit(event, data);
  },
  // Location
  driverJoinRoute,
  driverLeaveRoute,
  cadeteJoinRoute,
  cadeteLeaveRoute,
  driverUpdateLocation,
  cadeteUpdateLocation,
  onDriverLocation,
  onTransportLocation,
  offDriverLocation,
  offTransportLocation,
  // Chat
  joinChat,
  sendChatMessage,
  onNewMessage,
  offNewMessage,
};
