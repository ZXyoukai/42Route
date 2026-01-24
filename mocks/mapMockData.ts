import { Route, MiniBusStop, Driver, DriverCoordinates } from '../types/api';

// Mock data for Luanda, Angola coordinates
export const mockMiniBusStops: MiniBusStop[] = [
  {
    id: 1,
    stop_name: 'Campus 42 Luanda',
    distrit: 'Talatona',
    latitude: -8.9334,
    longitude: 13.1897,
    cadetes: [],
    route: {} as Route,
  },
  {
    id: 2,
    stop_name: 'Belas Shopping',
    distrit: 'Belas',
    latitude: -8.9556,
    longitude: 13.1878,
    cadetes: [],
    route: {} as Route,
  },
  {
    id: 3,
    stop_name: 'Praça da Independência',
    distrit: 'Ingombota',
    latitude: -8.8115,
    longitude: 13.2343,
    cadetes: [],
    route: {} as Route,
  },
  {
    id: 4,
    stop_name: 'Kilamba',
    distrit: 'Kilamba Kiaxi',
    latitude: -8.9897,
    longitude: 13.2345,
    cadetes: [],
    route: {} as Route,
  },
  {
    id: 5,
    stop_name: 'Viana',
    distrit: 'Viana',
    latitude: -8.8897,
    longitude: 13.3756,
    cadetes: [],
    route: {} as Route,
  },
  {
    id: 6,
    stop_name: 'Cacuaco',
    distrit: 'Cacuaco',
    latitude: -8.7734,
    longitude: 13.3701,
    cadetes: [],
    route: {} as Route,
  },
];

export const mockDriverCoordinates: DriverCoordinates[] = [
  {
    id: 1,
    lat: -8.9234,
    long: 13.1987,
    driver: {} as Driver,
  },
  {
    id: 2,
    lat: -8.8456,
    long: 13.2543,
    driver: {} as Driver,
  },
];

export const mockRoutes: Route[] = [
  {
    id: 1,
    route_name: 'Rota Norte - Campus',
    description: 'Rota que conecta os bairros do norte ao Campus 42 Luanda',
    stops: [
      mockMiniBusStops[5], // Cacuaco
      mockMiniBusStops[2], // Praça da Independência
      mockMiniBusStops[0], // Campus 42 Luanda
    ],
    drivers: [],
  },
  {
    id: 2,
    route_name: 'Rota Sul - Campus',
    description: 'Rota que conecta Talatona, Belas e Kilamba ao Campus',
    stops: [
      mockMiniBusStops[3], // Kilamba
      mockMiniBusStops[1], // Belas Shopping
      mockMiniBusStops[0], // Campus 42 Luanda
    ],
    drivers: [],
  },
  {
    id: 3,
    route_name: 'Rota Este - Campus',
    description: 'Rota que conecta Viana ao Campus 42 Luanda',
    stops: [
      mockMiniBusStops[4], // Viana
      mockMiniBusStops[2], // Praça da Independência
      mockMiniBusStops[0], // Campus 42 Luanda
    ],
    drivers: [],
  },
];

export const mockDrivers: Driver[] = [
  {
    id: 1,
    full_name: 'João Silva',
    username: 'jsilva',
    email: 'joao.silva@42luanda.com',
    photo: 'https://i.pravatar.cc/150?img=12',
    phone: 923456789,
    coordinates: [mockDriverCoordinates[0]],
    current_route: mockRoutes[0],
  },
  {
    id: 2,
    full_name: 'Maria Santos',
    username: 'msantos',
    email: 'maria.santos@42luanda.com',
    photo: 'https://i.pravatar.cc/150?img=45',
    phone: 923456790,
    coordinates: [mockDriverCoordinates[1]],
    current_route: mockRoutes[1],
  },
];

// Simulate real-time driver location updates
export const generateMockDriverLocation = (routeId: number): { lat: number; long: number } => {
  const route = mockRoutes.find(r => r.id === routeId);
  if (!route || route.stops.length === 0) {
    return { lat: -8.9334, long: 13.1897 }; // Default to Campus
  }

  const randomStop = route.stops[Math.floor(Math.random() * route.stops.length)];
  const latOffset = (Math.random() - 0.5) * 0.01; // Small random offset
  const longOffset = (Math.random() - 0.5) * 0.01;

  return {
    lat: (randomStop.latitude || -8.9334) + latOffset,
    long: (randomStop.longitude || 13.1897) + longOffset,
  };
};

// Map center for Luanda
export const LUANDA_CENTER = {
  latitude: -8.8383,
  longitude: 13.2344,
  latitudeDelta: 0.3,
  longitudeDelta: 0.3,
};
