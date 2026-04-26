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

/** Broadcast acknowledgment from server — how many cadetes are listening */
export interface BroadcastAck {
  routeId: number;
  listenersCount: number;
  timestamp: number;
}

/** Connection state for sonar UI */
export type ConnectionState = 'connected' | 'reconnecting' | 'disconnected';

// ─── Singleton socket ─────────────────────────────────────────────────────

let _socket: Socket | null = null;
const RECONNECT_INTERVAL = 1000; // 1 second initial delay

// State listeners to track connection status
let _connectionStatusListeners: ((connected: boolean) => void)[] = [];
let _connectionStateListeners: ((state: ConnectionState) => void)[] = [];

// BUG-02 FIX: Track active room membership for auto re-join on reconnect
let _activeDriverId: number | null = null;
let _activeCadeteId: number | null = null;

// Track last successful update for sonar UI
let _lastUpdateTimestamp: number = 0;
let _broadcastAckListeners: ((ack: BroadcastAck) => void)[] = [];

/**
 * BUG-01 FIX: Only create socket instance ONCE.
 * Previously: `if (!_socket || !_socket.connected)` — this recreated the socket
 * on every temporary disconnect, destroying all registered listeners.
 * Now: Only create if `_socket === null`. Socket.IO's built-in reconnection
 * handles temporary disconnects automatically.
 */
function getSocket(): Socket {
  if (!_socket) {
    const baseUrl = (SOCKET_URL?.trim() || 'http://127.0.0.1:3000').replace(/\/$/, '');

    console.log(`[SocketService] 🔌 Inicializando Socket.IO em ${baseUrl}`);

    _socket = io(baseUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: RECONNECT_INTERVAL,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,  // Never give up reconnecting
    });

    // Connection events
    _socket.on('connect', () => {
      console.log(`[SocketService] 🟢 Socket conectado: ${_socket?.id}`);
      _notifyConnectionState('connected');
      _connectionStatusListeners.forEach(listener => listener(true));

      // BUG-02 FIX: Re-join rooms automatically after reconnection
      _rejoinRooms();
    });

    _socket.on('disconnect', (reason) => {
      console.log(`[SocketService] 🔴 Socket desconectado. Motivo: ${reason}`);
      _notifyConnectionState('disconnected');
      _connectionStatusListeners.forEach(listener => listener(false));
    });

    _socket.on('connect_error', (err) => {
      console.warn(`[SocketService] ⚠️ Erro de conexão:`, err.message);
      _notifyConnectionState('reconnecting');
    });

    _socket.io.on('reconnect_attempt', (attempt) => {
      console.log(`[SocketService] 🔄 Tentativa de reconexão #${attempt}`);
      _notifyConnectionState('reconnecting');
    });

    _socket.io.on('reconnect', (attempt) => {
      console.log(`[SocketService] ✅ Reconectado com sucesso após ${attempt} tentativa(s)!`);
      _notifyConnectionState('connected');
    });

    _socket.io.on('reconnect_failed', () => {
      console.warn(`[SocketService] ❌ Falha na reconexão`);
      _notifyConnectionState('disconnected');
    });

    // Listen for broadcast acknowledgments from server
    _socket.on('driver:broadcast-ack', (ack: BroadcastAck) => {
      _broadcastAckListeners.forEach(listener => listener(ack));
    });
  }
  return _socket;
}

/**
 * BUG-02 FIX: Re-join rooms after socket reconnects.
 * When the socket disconnects and reconnects, all room memberships are lost
 * on the server side. This re-emits the join events to restore them.
 */
function _rejoinRooms() {
  if (_activeDriverId !== null) {
    console.log(`[SocketService] 🔄 Re-joining route for driver ${_activeDriverId}`);
    getSocket().emit('driver:joinRoute', { driverId: _activeDriverId });
  }
  if (_activeCadeteId !== null) {
    console.log(`[SocketService] 🔄 Re-joining route for cadete ${_activeCadeteId}`);
    getSocket().emit('cadete:joinRoute', { cadeteId: _activeCadeteId });
  }
}

function _notifyConnectionState(state: ConnectionState) {
  _connectionStateListeners.forEach(listener => listener(state));
}

function disconnect() {
  if (_socket) {
    console.log(`[SocketService] 🧹 Desconectando Socket`);
    _socket.disconnect();
    _socket = null;
    _activeDriverId = null;
    _activeCadeteId = null;
  }
}

// ─── Connection Status Tracking ────────────────────────────────────────────

function onConnectionChange(callback: (connected: boolean) => void) {
  _connectionStatusListeners.push(callback);
}

function offConnectionChange(callback: (connected: boolean) => void) {
  _connectionStatusListeners = _connectionStatusListeners.filter(l => l !== callback);
}

/** Subscribe to detailed connection state changes (for sonar UI) */
function onConnectionStateChange(callback: (state: ConnectionState) => void) {
  _connectionStateListeners.push(callback);
}

function offConnectionStateChange(callback: (state: ConnectionState) => void) {
  _connectionStateListeners = _connectionStateListeners.filter(l => l !== callback);
}

function isConnected(): boolean {
  return _socket?.connected ?? false;
}

/** Get the current connection state */
function getConnectionState(): ConnectionState {
  if (!_socket) return 'disconnected';
  if (_socket.connected) return 'connected';
  return 'reconnecting';
}

// ─── Broadcast ACK tracking (for sonar) ──────────────────────────────────

function onBroadcastAck(callback: (ack: BroadcastAck) => void) {
  _broadcastAckListeners.push(callback);
}

function offBroadcastAck(callback: (ack: BroadcastAck) => void) {
  _broadcastAckListeners = _broadcastAckListeners.filter(l => l !== callback);
}

function getLastUpdateTimestamp(): number {
  return _lastUpdateTimestamp;
}

// ─── Location events ──────────────────────────────────────────────────────

/** Motorista entra no room da sua rota */
function driverJoinRoute(driverId: number) {
  console.log(`[SocketService] 🚗 Driver ${driverId} joining route`);
  _activeDriverId = driverId;  // BUG-02: Track for re-join
  getSocket().emit('driver:joinRoute', { driverId });
}

/** Motorista sai do room da sua rota */
function driverLeaveRoute(driverId: number) {
  console.log(`[SocketService] 🚗 Driver ${driverId} leaving route`);
  _activeDriverId = null;  // BUG-02: Clear tracking
  getSocket().emit('driver:leaveRoute', { driverId });
}

/** Cadete entra no room da sua rota */
function cadeteJoinRoute(cadeteId: number) {
  console.log(`[SocketService] 👤 Cadete ${cadeteId} joining route`);
  _activeCadeteId = cadeteId;  // BUG-02: Track for re-join
  getSocket().emit('cadete:joinRoute', { cadeteId });
}

/** Cadete sai do room da sua rota */
function cadeteLeaveRoute(cadeteId: number) {
  console.log(`[SocketService] 👤 Cadete ${cadeteId} leaving route`);
  _activeCadeteId = null;  // BUG-02: Clear tracking
  getSocket().emit('cadete:leaveRoute', { cadeteId });
}

/** Motorista emite a sua localização */
function driverUpdateLocation(id_driver: number, lat: number, long_: number) {
  console.log(`[SocketService] 📍 Driver location: ${lat}, ${long_}`);
  _lastUpdateTimestamp = Date.now();
  getSocket().emit('driver:updateLocation', { id_driver, lat, long: long_ });
}

/** Motorista envia atualização de paragem atual */
function driverSetCurrentStop(driverId: number, stopId: number) {
  console.log(`[SocketService] 📍 Motorista ${driverId} marcou paragem ${stopId}`);
  getSocket().emit('driver:setCurrentStop', { driverId, stopId });
}

/** Cadete emite a sua localização (fallback quando motorista inativo) */
function cadeteUpdateLocation(cadeteId: number, lat: number, long_: number) {
  console.log(`[SocketService] 📍 Cadete location: ${lat}, ${long_}`);
  _lastUpdateTimestamp = Date.now();
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

/** Ouve notificação de motorista offline */
function onDriverOffline(cb: (payload: { routeId: number }) => void) {
  getSocket().on('driver:offline', cb);
  console.log(`[SocketService] 📡 Listener added: driver:offline`);
}

/** Ouve atualização de paragem atual */
function onCurrentStopUpdate(cb: (payload: { routeId: number; stopId: number; driverId: number; timestamp: number }) => void) {
  getSocket().on('route:currentStop', cb);
  console.log(`[SocketService] 📡 Listener added: route:currentStop`);
}

function offCurrentStopUpdate(cb?: (payload: { routeId: number; stopId: number; driverId: number; timestamp: number }) => void) {
  if (cb) {
    getSocket().off('route:currentStop', cb);
  } else {
    getSocket().off('route:currentStop');
  }
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

function offDriverOffline(cb?: (payload: { routeId: number }) => void) {
  if (cb) {
    getSocket().off('driver:offline', cb);
  } else {
    getSocket().off('driver:offline');
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
  getConnectionState,
  onConnectionChange,
  offConnectionChange,
  onConnectionStateChange,
  offConnectionStateChange,
  // Broadcast ACK (sonar)
  onBroadcastAck,
  offBroadcastAck,
  getLastUpdateTimestamp,
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
  driverSetCurrentStop,
  cadeteUpdateLocation,
  onDriverLocation,
  onTransportLocation,
  onDriverOffline,
  onCurrentStopUpdate,
  offDriverLocation,
  offTransportLocation,
  offDriverOffline,
  offCurrentStopUpdate,
  // Chat
  joinChat,
  sendChatMessage,
  onNewMessage,
  offNewMessage,
};
