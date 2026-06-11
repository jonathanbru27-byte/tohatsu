import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCalendar, CalendarioEvento } from '@/src/services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CustomTabBar from '@/src/components/CustomTabBar';

export default function CalendarScreen() {
  const router = useRouter();
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
    <View style={styles.eventoCard} testID={`evento-${item.id}`}>
      <View style={styles.dateIconContainer}>
        <Ionicons name="calendar" size={28} color="#E63946" />
      </View>
      <View style={styles.eventoInfo}>
        <Text style={styles.dateText}>{formatDate(item.fecha)}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="#888" />
          <Text style={styles.locationText}>{item.localidad}</Text>
        </View>
        <Text style={styles.descriptionText}>{item.descripcion}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MANTENIMIENTO GRATUITO</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
          <Ionicons name="arrow-back" size={28} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendario</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.sectionTitle}>
        <View style={styles.sectionTitleBar} />
        <Text style={styles.sectionTitleText}>JORNADAS DE MANTENIMIENTO</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      ) : eventos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No hay eventos programados</Text>
          <Text style={styles.emptySubtext}>
            Pronto publicaremos las fechas de nuestros servicios gratuitos
          </Text>
        </View>
      ) : (
        <FlatList
          data={eventos}
          renderItem={renderEvento}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />}
        />
      )}

      <CustomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#F2F2F4',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitleBar: {
    width: 24,
    height: 3,
    backgroundColor: '#E63946',
    borderRadius: 2,
  },
  sectionTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 1.5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  eventoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  dateIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFE5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventoInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 10,
  },
  badge: {
    backgroundColor: '#FFE5E8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#E63946',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
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
