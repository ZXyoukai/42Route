import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  mockSchedules,
  getTodaySchedules,
  getSchedulesByRoute,
  daysOfWeek,
  ScheduleEntry,
} from '../mocks';
import {
  getTimeUntilSchedule,
  isPastTime,
  formatTime,
  groupSchedulesByRoute,
  getRouteColor,
} from '../utils/apiHelpers';

/**
 * Example Schedule Component showing transport schedules
 * This component uses mock data for demonstration
 */
export default function ExampleScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current day
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const today = days[new Date().getDay()];
    setSelectedDay(today);

    // Load today's schedules
    loadSchedules(today, null);
    setLoading(false);
  }, []);

  const loadSchedules = (day: string, routeId: number | null) => {
    let schedules = mockSchedules.filter((s) => s.dayOfWeek.includes(day));

    if (routeId !== null) {
      schedules = schedules.filter((s) => s.routeId === routeId);
    }

    // Sort by time
    schedules.sort((a, b) => {
      const timeA = a.arrivalTime.split(':').map(Number);
      const timeB = b.arrivalTime.split(':').map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });

    setFilteredSchedules(schedules);
  };

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    loadSchedules(day, selectedRoute);
  };

  const handleRouteSelect = (routeId: number | null) => {
    setSelectedRoute(routeId);
    loadSchedules(selectedDay, routeId);
  };

  const getStatusColor = (schedule: ScheduleEntry) => {
    if (isPastTime(schedule.departureTime)) {
      return '#999';
    }
    switch (schedule.status) {
      case 'in-progress':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#FF9800';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Carregando horários...</Text>
      </View>
    );
  }

  const groupedSchedules = groupSchedulesByRoute(filteredSchedules);

  return (
    <View style={styles.container}>
      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daySelectorContainer}>
        {daysOfWeek.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayButton, selectedDay === day && styles.dayButtonActive]}
            onPress={() => handleDaySelect(day)}>
            <Text style={[styles.dayButtonText, selectedDay === day && styles.dayButtonTextActive]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Route filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.routeFilterContainer}>
        <TouchableOpacity
          style={[styles.routeButton, selectedRoute === null && styles.routeButtonActive]}
          onPress={() => handleRouteSelect(null)}>
          <Text
            style={[
              styles.routeButtonText,
              selectedRoute === null && styles.routeButtonTextActive,
            ]}>
            Todas as Rotas
          </Text>
        </TouchableOpacity>
        {[1, 2, 3].map((routeId) => (
          <TouchableOpacity
            key={routeId}
            style={[
              styles.routeButton,
              selectedRoute === routeId && styles.routeButtonActive,
              { borderColor: getRouteColor(routeId) },
            ]}
            onPress={() => handleRouteSelect(routeId)}>
            <Text
              style={[
                styles.routeButtonText,
                selectedRoute === routeId && styles.routeButtonTextActive,
              ]}>
              Rota {routeId}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Schedule list */}
      <ScrollView style={styles.scheduleList}>
        {Object.keys(groupedSchedules).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum horário disponível para {selectedDay}</Text>
          </View>
        ) : (
          Object.entries(groupedSchedules).map(([routeName, schedules]) => (
            <View key={routeName} style={styles.routeGroup}>
              <Text style={styles.routeGroupTitle}>{routeName}</Text>
              {schedules.map((schedule) => (
                <View
                  key={schedule.id}
                  style={[
                    styles.scheduleCard,
                    { borderLeftColor: getRouteColor(schedule.routeId) },
                  ]}>
                  <View style={styles.scheduleHeader}>
                    <Text style={styles.stopName}>{schedule.stopName}</Text>
                    <View
                      style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule) }]}>
                      <Text style={styles.statusText}>
                        {getTimeUntilSchedule(schedule.arrivalTime)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.scheduleDetails}>
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeLabel}>Chegada</Text>
                      <Text style={styles.timeValue}>{formatTime(schedule.arrivalTime)}</Text>
                    </View>
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeLabel}>Partida</Text>
                      <Text style={styles.timeValue}>{formatTime(schedule.departureTime)}</Text>
                    </View>
                  </View>

                  <Text style={styles.driverName}>Motorista: {schedule.driverName}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  daySelectorContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  dayButtonActive: {
    backgroundColor: '#0066CC',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dayButtonTextActive: {
    color: 'white',
  },
  routeFilterContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  routeButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  routeButtonActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  routeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  routeButtonTextActive: {
    color: 'white',
  },
  scheduleList: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  routeGroup: {
    marginBottom: 20,
  },
  routeGroupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    paddingLeft: 5,
  },
  scheduleCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  scheduleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  driverName: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
});
