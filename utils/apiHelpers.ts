/**
 * Utilitários para trabalhar com a API
 */

import { MiniBusStop, Route, Driver } from '../types/api';

/**
 * Calcula a distância entre dois pontos geográficos usando a fórmula de Haversine
 * @param lat1 Latitude do ponto 1
 * @param lon1 Longitude do ponto 1
 * @param lat2 Latitude do ponto 2
 * @param lon2 Longitude do ponto 2
 * @returns Distância em quilômetros
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Arredondar para 2 casas decimais
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Encontra a paragem mais próxima da localização atual
 * @param currentLat Latitude atual
 * @param currentLon Longitude atual
 * @param stops Lista de paragens
 * @returns Paragem mais próxima e a distância
 */
export const findNearestStop = (
  currentLat: number,
  currentLon: number,
  stops: MiniBusStop[]
): { stop: MiniBusStop; distance: number } | null => {
  const validStops = stops.filter(
    (stop) => stop.latitude !== null && stop.longitude !== null
  );

  if (validStops.length === 0) return null;

  let nearest: MiniBusStop | null = null;
  let minDistance = Infinity;

  validStops.forEach((stop) => {
    const distance = calculateDistance(
      currentLat,
      currentLon,
      stop.latitude!,
      stop.longitude!
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = stop;
    }
  });

  return nearest ? { stop: nearest, distance: minDistance } : null;
};

/**
 * Calcula o tempo estimado de chegada baseado na distância e velocidade média
 * @param distanceKm Distância em km
 * @param averageSpeedKmh Velocidade média em km/h (padrão: 40 km/h)
 * @returns Tempo em minutos
 */
export const calculateETA = (
  distanceKm: number,
  averageSpeedKmh: number = 40
): number => {
  const hours = distanceKm / averageSpeedKmh;
  const minutes = Math.round(hours * 60);
  return minutes;
};

/**
 * Formata o tempo estimado de chegada
 * @param minutes Minutos
 * @returns String formatada (ex: "15 min", "1h 30min")
 */
export const formatETA = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

/**
 * Verifica se uma rota está ativa (tem motoristas atribuídos)
 * @param route Rota
 * @returns true se ativa, false caso contrário
 */
export const isRouteActive = (route: Route): boolean => {
  return route.drivers?.some((driver) => driver.current_route?.id === route.id) || false;
};

/**
 * Conta quantos cadetes estão em uma rota
 * @param route Rota
 * @returns Número de cadetes
 */
export const countCadetesInRoute = (route: Route): number => {
  if (!route.stops) return 0;
  
  return route.stops.reduce((total, stop) => {
    return total + (stop.cadetes?.length || 0);
  }, 0);
};

/**
 * Formata coordenadas para exibição
 * @param lat Latitude
 * @param lon Longitude
 * @param precision Número de casas decimais (padrão: 6)
 * @returns String formatada
 */
export const formatCoordinates = (
  lat: number,
  lon: number,
  precision: number = 6
): string => {
  return `${lat.toFixed(precision)}, ${lon.toFixed(precision)}`;
};

/**
 * Valida se as coordenadas são válidas
 * @param lat Latitude
 * @param lon Longitude
 * @returns true se válidas, false caso contrário
 */
export const isValidCoordinate = (lat: number, lon: number): boolean => {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

/**
 * Obtém a cor do status da rota
 * @param route Rota
 * @returns Cor em formato hex
 */
export const getRouteStatusColor = (route: Route): string => {
  const isActive = isRouteActive(route);
  return isActive ? '#00babc' : '#64748b';
};

/**
 * Calcula a ocupação de uma rota (cadetes vs capacidade)
 * @param route Rota
 * @param busCapacity Capacidade do autocarro (padrão: 35)
 * @returns Percentagem de ocupação
 */
export const calculateOccupancy = (
  route: Route,
  busCapacity: number = 35
): number => {
  const cadetes = countCadetesInRoute(route);
  return Math.round((cadetes / busCapacity) * 100);
};

/**
 * Agrupa paragens por distrito
 * @param stops Lista de paragens
 * @returns Objeto com paragens agrupadas por distrito
 */
export const groupStopsByDistrict = (
  stops: MiniBusStop[]
): Record<string, MiniBusStop[]> => {
  return stops.reduce((acc, stop) => {
    const district = stop.distrit || 'Sem Distrito';
    if (!acc[district]) {
      acc[district] = [];
    }
    acc[district].push(stop);
    return acc;
  }, {} as Record<string, MiniBusStop[]>);
};

/**
 * Verifica se um motorista está online (tem localização recente)
 * @param driver Motorista
 * @param maxAgeMinutes Idade máxima da localização em minutos (padrão: 5)
 * @returns true se online, false caso contrário
 */
export const isDriverOnline = (
  driver: Driver,
  maxAgeMinutes: number = 5
): boolean => {
  if (!driver.coordinates || driver.coordinates.length === 0) {
    return false;
  }

  // Se tiver campo timestamp nas coordenadas, verificar
  // Por enquanto, apenas verifica se tem coordenadas
  return driver.coordinates.length > 0;
};

/**
 * Formata número de telefone para exibição
 * @param phone Número de telefone
 * @returns String formatada
 */
export const formatPhoneNumber = (phone: number | null): string => {
  if (!phone) return 'N/A';
  
  const phoneStr = phone.toString();
  
  // Formato: +244 923 456 789
  if (phoneStr.startsWith('244')) {
    return `+${phoneStr.slice(0, 3)} ${phoneStr.slice(3, 6)} ${phoneStr.slice(6, 9)} ${phoneStr.slice(9)}`;
  }
  
  return phoneStr;
};

/**
 * Gera cor única baseada em string (para avatares, etc)
 * @param str String
 * @returns Cor em formato hex
 */
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const color = Math.abs(hash).toString(16).substring(0, 6);
  return `#${color.padEnd(6, '0')}`;
};

/**
 * Debounce para otimizar chamadas de API
 * @param func Função a ser executada
 * @param wait Tempo de espera em ms
 * @returns Função com debounce
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Retry para chamadas de API que falharam
 * @param fn Função assíncrona
 * @param maxRetries Número máximo de tentativas
 * @param delay Delay entre tentativas em ms
 * @returns Resultado da função
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries <= 0) {
      throw error;
    }
    
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, maxRetries - 1, delay * 2); // Exponential backoff
  }
};
