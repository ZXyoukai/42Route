// Mock data for transport schedules

export interface ScheduleEntry {
  id: number;
  routeId: number;
  routeName: string;
  driverId: number;
  driverName: string;
  stopId: number;
  stopName: string;
  arrivalTime: string;
  departureTime: string;
  dayOfWeek: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const mockSchedules: ScheduleEntry[] = [
  // Rota Norte - Campus (Route 1)
  {
    id: 1,
    routeId: 1,
    routeName: 'Rota Norte - Campus',
    driverId: 1,
    driverName: 'João Silva',
    stopId: 6,
    stopName: 'Cacuaco',
    arrivalTime: '06:30',
    departureTime: '06:35',
    dayOfWeek: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    status: 'scheduled',
  },
  {
    id: 2,
    routeId: 1,
    routeName: 'Rota Norte - Campus',
    driverId: 1,
    driverName: 'João Silva',
    stopId: 3,
    stopName: 'Praça da Independência',
    arrivalTime: '07:00',
    departureTime: '07:05',
    dayOfWeek: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    status: 'scheduled',
  },
  {
    id: 3,
    routeId: 1,
    routeName: 'Rota Norte - Campus',
    driverId: 1,
    driverName: 'João Silva',
    stopId: 1,
    stopName: 'Campus 42 Luanda',
    arrivalTime: '07:30',
    departureTime: '07:35',
    dayOfWeek: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    status: 'scheduled',
  },

  // Rota Sul - Campus (Route 2)
  {
    id: 4,
    routeId: 2,
    routeName: 'Rota Sul - Campus',
    driverId: 2,
    driverName: 'Maria Santos',
    stopId: 4,
    stopName: 'Kilamba',
    arrivalTime: '06:45',
    departureTime: '06:50',
    dayOfWeek: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    status: 'scheduled',
  },
  {
    id: 5,
    routeId: 2,
    routeName: 'Rota Sul - Campus',
    driverId: 2,
    driverName: 'Maria Santos',
    stopId: 2,
    stopName: 'Belas Shopping',
    arrivalTime: '07:05',
    departureTime: '07:10',
    dayOfWeek: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    status: 'scheduled',
  },
  {
    id: 6,
    routeId: 2,
    routeName: 'Rota Sul - Campus',
    driverId: 2,
    driverName: 'Maria Santos',
    stopId: 1,
    stopName: 'Campus 42 Luanda',
    arrivalTime: '07:25',
    departureTime: '07:30',
    dayOfWeek: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    status: 'scheduled',
  },

  // Rota Este - Campus (Route 3)
  {
    id: 7,
    routeId: 3,
    routeName: 'Rota Este - Campus',
    driverId: 1,
    driverName: 'João Silva',
    stopId: 5,
    stopName: 'Viana',
    arrivalTime: '06:40',
    departureTime: '06:45',
    dayOfWeek: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    status: 'scheduled',
  },
  {
    id: 8,
    routeId: 3,
    routeName: 'Rota Este - Campus',
    driverId: 1,
    driverName: 'João Silva',
    stopId: 3,
    stopName: 'Praça da Independência',
    arrivalTime: '07:15',
    departureTime: '07:20',
    dayOfWeek: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    status: 'scheduled',
  },
  {
    id: 9,
    routeId: 3,
    routeName: 'Rota Este - Campus',
    driverId: 1,
    driverName: 'João Silva',
    stopId: 1,
    stopName: 'Campus 42 Luanda',
    arrivalTime: '07:40',
    departureTime: '07:45',
    dayOfWeek: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    status: 'scheduled',
  },

  // Return schedules - Afternoon
  {
    id: 10,
    routeId: 1,
    routeName: 'Rota Norte - Campus (Regresso)',
    driverId: 1,
    driverName: 'João Silva',
    stopId: 1,
    stopName: 'Campus 42 Luanda',
    arrivalTime: '17:00',
    departureTime: '17:05',
    dayOfWeek: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    status: 'scheduled',
  },
  {
    id: 11,
    routeId: 1,
    routeName: 'Rota Norte - Campus (Regresso)',
    driverId: 1,
    driverName: 'João Silva',
    stopId: 3,
    stopName: 'Praça da Independência',
    arrivalTime: '17:30',
    departureTime: '17:35',
    dayOfWeek: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    status: 'scheduled',
  },
  {
    id: 12,
    routeId: 1,
    routeName: 'Rota Norte - Campus (Regresso)',
    driverId: 1,
    driverName: 'João Silva',
    stopId: 6,
    stopName: 'Cacuaco',
    arrivalTime: '18:00',
    departureTime: '18:05',
    dayOfWeek: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    status: 'scheduled',
  },
];

export const getSchedulesByRoute = (routeId: number): ScheduleEntry[] => {
  return mockSchedules.filter(schedule => schedule.routeId === routeId);
};

export const getSchedulesByDay = (day: string): ScheduleEntry[] => {
  return mockSchedules.filter(schedule => schedule.dayOfWeek.includes(day));
};

export const getSchedulesByStop = (stopId: number): ScheduleEntry[] => {
  return mockSchedules.filter(schedule => schedule.stopId === stopId);
};

export const getTodaySchedules = (): ScheduleEntry[] => {
  const today = new Date().getDay();
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return getSchedulesByDay(dayNames[today]);
};
