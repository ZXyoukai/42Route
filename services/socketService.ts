import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@env';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Singleton socket ─────────────────────────────────────────────────────────

let _socket: Socket | null = null;

function getSocket(): Socket {
  if (!_socket || !_socket.connected) {
    _socket = io(API_BASE_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
    _socket.on('connect', () => console.log('🟢 Socket conectado:', _socket?.id));
    _socket.on('disconnect', () => console.log('🔴 Socket desconectado'));
    _socket.on('connect_error', (err) => console.warn('⚠️ Socket erro de conexão:', err.message));
  }
  return _socket;
}

function disconnect() {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}

// ─── Location events ──────────────────────────────────────────────────────────

/** Motorista entra no room da sua rota */
function driverJoinRoute(driverId: number) {
  getSocket().emit('driver:joinRoute', { driverId });
}

/** Cadete entra no room da sua rota */
function cadeteJoinRoute(cadeteId: number) {
  getSocket().emit('cadete:joinRoute', { cadeteId });
}

/** Motorista emite a sua localização */
function driverUpdateLocation(id_driver: number, lat: number, long_: number) {
  getSocket().emit('driver:updateLocation', { id_driver, lat, long: long_ });
}

/** Cadete emite a sua localização (fallback quando motorista inativo) */
function cadeteUpdateLocation(cadeteId: number, lat: number, long_: number) {
  getSocket().emit('cadete:updateLocation', { cadeteId, lat, long: long_ });
}

/** Ouve a posição do motorista (cadetes e motorista) */
function onDriverLocation(cb: (payload: DriverLocationPayload) => void) {
  getSocket().on('driver:location', cb);
}

/** Ouve a posição do transporte quando enviada por um cadete */
function onTransportLocation(cb: (payload: TransportLocationPayload) => void) {
  getSocket().on('transport:location', cb);
}

function offDriverLocation(cb?: (payload: DriverLocationPayload) => void) {
  if (cb) getSocket().off('driver:location', cb);
  else getSocket().off('driver:location');
}

function offTransportLocation(cb?: (payload: TransportLocationPayload) => void) {
  if (cb) getSocket().off('transport:location', cb);
  else getSocket().off('transport:location');
}

// ─── Chat events ──────────────────────────────────────────────────────────────

/** Entrar numa sala de chat */
function joinChat(type: 'GENERAL' | 'ROUTE', routeId?: number) {
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
  getSocket().emit('chat:send', payload);
}

/** Ouvir novas mensagens */
function onNewMessage(cb: (msg: ChatMessage) => void) {
  getSocket().on('chat:new-message', cb);
}

function offNewMessage(cb?: (msg: ChatMessage) => void) {
  if (cb) getSocket().off('chat:new-message', cb);
  else getSocket().off('chat:new-message');
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const socketService = {
  getSocket,
  disconnect,
  // Location
  driverJoinRoute,
  cadeteJoinRoute,
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
