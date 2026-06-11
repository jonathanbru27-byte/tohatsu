import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMotors, deleteMotor, Motor } from '@/src/services/api';

export default function MotorsManagementScreen() {
  const router = useRouter();
  const [motors, setMotors] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMotors();
  }, []);

  const loadMotors = async () => {
    try {
      const data = await getMotors();
      setMotors(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los motores');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirmar',
      '¿Está seguro de eliminar este motor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMotor(id);
              loadMotors();
              Alert.alert('Éxito', 'Motor eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el motor');
            }
          },
        },
      ]
    );
  };

  const renderMotor = ({ item }: { item: Motor }) => (
    <View style={styles.motorCard}>
      <Image source={{ uri: item.imagen }} style={styles.motorImage} resizeMode="cover" />
      <View style={styles.motorInfo}>
        <Text style={styles.motorModel}>{item.modelo}</Text>
        <Text style={styles.motorPrice}>${item.precio.toLocaleString()}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/admin/motors/edit/${item.id}` as any)}
        >
          <Ionicons name="create" size={20} color="#0066cc" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id!)}
        >
          <Ionicons name="trash" size={20} color="#ff3b30" />
        </TouchableOpacity>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#0066cc" />
        </TouchableOpacity>
        <Text style={styles.title}>Gestionar Motores</Text>
        <TouchableOpacity onPress={() => router.push('/admin/motors/add')}>
          <Ionicons name="add-circle" size={32} color="#0066cc" />
        </TouchableOpacity>
      </View>

      {motors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="boat-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No hay motores registrados</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/admin/motors/add')}
          >
            <Text style={styles.addButtonText}>Agregar motor</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={motors}
          renderItem={renderMotor}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.list}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  motorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  motorImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
  },
  motorInfo: {
    flex: 1,
    padding: 12,
  },
  motorModel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  motorPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066cc',
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f3ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffe6e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#0066cc',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
