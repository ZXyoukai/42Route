
export interface ScheduleInfo {
  routeName: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  frequency: string;
  isActive: boolean;
}

export interface routeInfo {
  distrit: string;
  id: number;
  latitude: string;
  longitude: string;
  stop_name: string;
}