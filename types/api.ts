// Auto-generated types from OpenAPI schema

export interface Admin {
  id: number;
  full_name: string | null;
  username: string | null;
  email: string | null;
}

export interface DriverCoordinates {
  id: number;
  lat: number;
  long: number;
  driver: Driver;
}

export interface Driver {
  id: number;
  full_name: string | null;
  username: string | null;
  email: string | null;
  photo: string | null;
  phone: number | null;
  coordinates: DriverCoordinates[];
  current_route: Route | null;
}

export interface MiniBusStop {
  id: number;
  stop_name: string | null;
  distrit: string | null;
  latitude: number | null;
  longitude: number | null;
  cadetes: Cadete[];
  route: Route;
}

export interface Route {
  id: number;
  route_name: string;
  description: string | null;
  stops: MiniBusStop[];
  drivers: Driver[];
}

export interface Cadete {
  id: number;
  full_name: string | null;
  username: string | null;
  email: string | null;
  city: string | null;
  distrit: string | null;
  phone: number | null;
  stop_id : number | null;
  stop: MiniBusStop | null;
  avatar: {
    link: string;
  };
  course: string;
  level: number;
  grade: string;
  isDBUser: boolean;
}

export interface Message {
  id: number;
  sender_id: number;
  senderType: number;
  content: string;
  createdAt: string;
  chat: Chat;
}

export interface Chat {
  id: number;
  full_name: string | null;
  type: 'GENERAL' | 'ROUTE';
  route_id: number | null;
  createdAt: string;
  messages: Message[];
}

// Request/Response types
export interface CreateAdminRequest {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateAdminRequest {
  name?: string;
  phone?: string;
}

export interface CreateCadeteRequest {
  full_name: string;
  username?: string;
  email: string;
  city?: string;
  distrit?: string;
  phone?: number;
  stop_id?: number;
  avatar?: {
    link: string;
  };
  course?: string;
  level?: number;
  grade?: string;
  isDBUser?: boolean;
}


/*
model Cadetes {
  id             Int          @id @default(autoincrement())
  full_name      String?
  username       String?      @unique
  email          String?      @unique
  city           String?
  distrit        String?
  prioritityList Boolean      @default(false)
  phone          Int?
  stop_id        Int?
  stop           MiniBusStop? @relation(fields: [stop_id], references: [id])
  //messages  Message[]    @relation("CadeteMessages")
  createdAt      DateTime     @default(now())
*/
export interface UpdateCadeteRequest {
  full_name?: string;
  username?: string;
  email?: string;
  city?: string;
  distrit?: string;
  phone?: number;
  stop_id?: number;
}

export interface CreateDriverRequest {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateDriverRequest {
  name?: string;
  phone?: string;
}

export interface UpdateDriverLocationRequest {
  lat: number;
  long: number;
}

export interface AssignRouteRequest {
  current_route_id: number;
}

// Simplified types for UI
export interface RouteInfo {
  id: number;
  route_name: string;
  description: string | null;
  stops: StopInfo[];
}

export interface StopInfo {
  id: number;
  stop_name: string | null;
  distrit: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface DriverLocation {
  lat: number;
  long: number;
  timestamp?: string;
}

// ─── Presença (QR Code) ────────────────────────────────────────────────────

export interface Attendance {
  id: number;
  cadete_id: number;
  route_id: number;
  trip_id: string;
  stop_id: number | null;
  scanned_at: string;
  lat: number | null;
  lng: number | null;
  cadete?: Cadete;
}

export interface TripQrResponse {
  trip_token: string;
  expires_in: number; // segundos
}

export interface MarkAttendanceRequest {
  trip_token: string;
  cadete_id: number;
  lat?: number;
  lng?: number;
}

// ─── Structured Error Handling ─────────────────────────────────────────────

export type ApiErrorType = 'timeout' | 'network' | 'server' | 'auth' | 'not_found' | 'unknown';

export interface ApiError {
  type: ApiErrorType;
  isTimeout: boolean;
  isNetworkError: boolean;
  statusCode: number | null;
  userMessage: string;
  technicalMessage: string;
}

/** Build a typed ApiError from a raw Axios/fetch error */
export function classifyError(err: any): ApiError {
  // Axios timeout
  if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
    return {
      type: 'timeout',
      isTimeout: true,
      isNetworkError: false,
      statusCode: null,
      userMessage: 'O servidor demorou demasiado a responder. Verifique a sua conexão e tente novamente.',
      technicalMessage: err?.message ?? 'Request timeout',
    };
  }

  // Network error (no response at all)
  if (err?.message === 'Network Error' || !err?.response) {
    return {
      type: 'network',
      isTimeout: false,
      isNetworkError: true,
      statusCode: null,
      userMessage: 'Sem conexão à internet. Verifique a sua rede e tente novamente.',
      technicalMessage: err?.message ?? 'Network error',
    };
  }

  const status = err?.response?.status;

  if (status === 401 || status === 403) {
    return {
      type: 'auth',
      isTimeout: false,
      isNetworkError: false,
      statusCode: status,
      userMessage: 'Sessão expirada. Por favor, faça login novamente.',
      technicalMessage: `HTTP ${status}: ${err?.response?.data?.message ?? 'Unauthorized'}`,
    };
  }

  if (status === 404) {
    return {
      type: 'not_found',
      isTimeout: false,
      isNetworkError: false,
      statusCode: 404,
      userMessage: 'O recurso solicitado não foi encontrado.',
      technicalMessage: `HTTP 404: ${err?.response?.data?.message ?? 'Not found'}`,
    };
  }

  if (status && status >= 500) {
    return {
      type: 'server',
      isTimeout: false,
      isNetworkError: false,
      statusCode: status,
      userMessage: 'Erro no servidor. Tente novamente mais tarde.',
      technicalMessage: `HTTP ${status}: ${err?.response?.data?.message ?? 'Server error'}`,
    };
  }

  return {
    type: 'unknown',
    isTimeout: false,
    isNetworkError: false,
    statusCode: status ?? null,
    userMessage: 'Ocorreu um erro inesperado. Tente novamente.',
    technicalMessage: err?.message ?? 'Unknown error',
  };
}
