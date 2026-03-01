declare module '@env' {
  export const API_BASE_URL: string;
}

declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '@mapbox/polyline' {
  const polyline: {
    decode(str: string, precision?: number): [number, number][];
    encode(coordinates: [number, number][], precision?: number): string;
  };
  export = polyline;
}
