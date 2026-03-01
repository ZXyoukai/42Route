import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  mockRoutes,
  mockDrivers,
  LUANDA_CENTER,
  generateMockDriverLocation,
} from '../mocks';
import { getRouteColor } from '../utils/apiHelpers';

/**
 * Example Map Component showing routes, stops, and driver locations
 * This component uses mock data for demonstration
 */
export default function ExampleMapScreen() {
  const [selectedRoute, setSelectedRoute] = useState(mockRoutes[0]);
  const [driverLocations, setDriverLocations] = useState<Record<number, { lat: number; long: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize map
    setLoading(false);

    // Simulate real-time driver location updates
    const interval = setInterval(() => {
      const newLocations: Record<number, { lat: number; long: number }> = {};
      
      mockDrivers.forEach(driver => {
        if (driver.current_route) {
          newLocations[driver.id] = generateMockDriverLocation(driver.current_route.id);
        }
      });
      
      setDriverLocations(newLocations);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={LUANDA_CENTER}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Render route stops */}
        {selectedRoute.stops.map((stop) => (
          stop.latitude && stop.longitude && (
            <Marker
              key={`stop-${stop.id}`}
              coordinate={{
                latitude: stop.latitude,
                longitude: stop.longitude,
              }}
              title={stop.stop_name || 'Paragem'}
              description={stop.distrit || ''}
              pinColor={getRouteColor(selectedRoute.id)}
            />
          )
        ))}

        {/* Render route polyline */}
        {selectedRoute.stops.length > 1 && (
          <Polyline
            coordinates={selectedRoute.stops
              .filter(stop => stop.latitude && stop.longitude)
              .map(stop => ({
                latitude: stop.latitude!,
                longitude: stop.longitude!,
              }))}
            strokeColor={getRouteColor(selectedRoute.id)}
            strokeWidth={4}
          />
        )}

        {/* Render active drivers */}
        {mockDrivers
          .filter(driver => driver.current_route?.id === selectedRoute.id)
          .map(driver => {
            const location = driverLocations[driver.id] || 
              (driver.coordinates[0] ? { lat: driver.coordinates[0].lat, long: driver.coordinates[0].long } : null);
            
            if (!location) return null;

            return (
              <Marker
                key={`driver-${driver.id}`}
                coordinate={{
                  latitude: location.lat,
                  longitude: location.long,
                }}
                title={driver.full_name || 'Motorista'}
                description={`Rota: ${driver.current_route?.route_name}`}
                image={require('../assets/images/bus-icon.png')} // Add a bus icon to your assets
              />
            );
          })}
      </MapView>

      {/* Route info overlay */}
      <View style={styles.routeInfo}>
        <Text style={styles.routeName}>{selectedRoute.route_name}</Text>
        <Text style={styles.routeDescription}>{selectedRoute.description}</Text>
        <Text style={styles.stopCount}>
          {selectedRoute.stops.length} paragens • {selectedRoute.drivers.length} motoristas
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  map: {
    flex: 1,
  },
  routeInfo: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  routeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  stopCount: {
    fontSize: 12,
    color: '#999',
  },
});
