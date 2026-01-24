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
  stop: MiniBusStop | null;
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
  name: string;
  email: string;
  phone: string;
}

export interface UpdateCadeteRequest {
  name?: string;
  phone?: string;
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
  route_id: number;
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
