import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCalendar, CalendarioEvento } from '@/src/services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CalendarScreen() {
  const [eventos, setEventos] = useState<CalendarioEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    try {
      const data = await getCalendar();
      setEventos(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los eventos');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEventos();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const renderEvento = ({ item }: { item: CalendarioEvento }) => (
    <View style={styles.eventoCard}>
      <View style={styles.dateContainer}>
        <Ionicons name="calendar" size={32} color="#0066cc" />
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>{formatDate(item.fecha)}</Text>
          <Text style={styles.locationText}>{item.localidad}</Text>
        </View>
      </View>
      <Text style={styles.descriptionText}>{item.descripcion}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Mantenimiento Gratuito</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {eventos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No hay eventos programados</Text>
          <Text style={styles.emptySubtext}>
            Pronto publicaremos las fechas de nuestros servicios de mantenimiento gratuito
          </Text>
        </View>
      ) : (
        <FlatList
          data={eventos}
          renderItem={renderEvento}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  eventoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  locationText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '600',
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#e6f3ff',
    borderRadius: 8,
    padding: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#0066cc',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
