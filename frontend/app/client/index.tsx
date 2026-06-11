import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMotors, Motor } from '@/src/services/api';

export default function CatalogoScreen() {
  const router = useRouter();
  const [motors, setMotors] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMotors();
  }, []);

  const loadMotors = async () => {
    try {
      const data = await getMotors();
      setMotors(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los motores');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMotors();
  };

  const renderMotor = ({ item }: { item: Motor }) => (
    <TouchableOpacity
      style={styles.motorCard}
      onPress={() => router.push(`/client/motor/${item.id}`)}
    >
      <Image
        source={{ uri: item.imagen }}
        style={styles.motorImage}
        resizeMode="cover"
      />
      <View style={styles.motorInfo}>
        <Text style={styles.motorModel}>{item.modelo}</Text>
        <Text style={styles.motorPower}>{item.potencia}</Text>
        <Text style={styles.motorPrice}>${item.precio.toLocaleString()}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={24} color="#0066cc" />
      </View>
    </TouchableOpacity>
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
      {motors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="boat-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No hay motores disponibles</Text>
          <Text style={styles.emptySubtext}>
            El administrador debe agregar motores al catálogo
          </Text>
        </View>
      ) : (
        <FlatList
          data={motors}
          renderItem={renderMotor}
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
  motorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  motorImage: {
    width: 120,
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  motorInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  motorModel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  motorPower: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  motorPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingRight: 16,
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
  },
});
