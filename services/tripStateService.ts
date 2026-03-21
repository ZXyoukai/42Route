import { Route } from '../types/api';

interface TripState {
  tripActive: boolean;
  activeRoute: Route | null;
  isTracking: boolean;
  driverId: number;
}

let tripState: TripState = {
  tripActive: false,
  activeRoute: null,
  isTracking: false,
  driverId: 0,
};

// Listeners para mudanças de estado
const listeners = new Set<(state: TripState) => void>();

export const tripStateService = {
  // Obter o estado atual da viagem
  getState: (): TripState => tripState,

  // Iniciar uma viagem
  startTrip: (driverId: number, route: Route) => {
    tripState = {
      tripActive: true,
      activeRoute: route,
      isTracking: true,
      driverId,
    };
    tripStateService.notify();
  },

  // Terminar uma viagem
  endTrip: () => {
    tripState = {
      tripActive: false,
      activeRoute: null,
      isTracking: false,
      driverId: tripState.driverId,
    };
    tripStateService.notify();
  },

  // Atualizar o estado de tracking
  setTracking: (isTracking: boolean) => {
    tripState = { ...tripState, isTracking };
    tripStateService.notify();
  },

  // Inscrever-se às mudanças de estado
  subscribe: (listener: (state: TripState) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // Notificar todos os listeners
  notify: () => {
    listeners.forEach((listener) => listener(tripState));
  },

  // Reset ao logout
  reset: () => {
    tripState = {
      tripActive: false,
      activeRoute: null,
      isTracking: false,
      driverId: 0,
    };
    tripStateService.notify();
  },
};
