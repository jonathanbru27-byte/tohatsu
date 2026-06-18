import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAsesores, deleteAsesor, Asesor } from '@/src/services/api';

export default function AsesoresAdminScreen() {
  const router = useRouter();
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadAsesores();
    }, [])
  );

  const loadAsesores = async () => {
    try {
      const data = await getAsesores();
      setAsesores(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los asesores');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, nombre: string) => {
    Alert.alert('Confirmar', `¿Eliminar al asesor "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAsesor(id);
            loadAsesores();
            Alert.alert('Éxito', 'Asesor eliminado');
          } catch {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  const renderAsesor = ({ item }: { item: Asesor }) => (
    <View style={styles.card} testID={`admin-asesor-${item.id}`}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={26} color="#0A1F44" />
      </View>
      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={1}>{item.nombre}</Text>
        <View style={styles.rowInfo}>
          <Ionicons name="location" size={12} color="#666" />
          <Text style={styles.provincia}>{item.provincia}</Text>
        </View>
        <View style={styles.rowInfo}>
          <Ionicons name="logo-whatsapp" size={12} color="#25D366" />
          <Text style={styles.whatsapp}>{item.whatsapp}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push(`/admin/asesores/edit/${item.id}` as any)}
          testID={`edit-asesor-${item.id}`}
        >
          <Ionicons name="create" size={18} color="#0A1F44" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id!, item.nombre)}
          testID={`delete-asesor-${item.id}`}
        >
          <Ionicons name="trash" size={18} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
          <Ionicons name="arrow-back" size={28} color="#0A1F44" />
        </TouchableOpacity>
        <Text style={styles.title}>Asesores por Zona</Text>
        <TouchableOpacity
          onPress={() => router.push('/admin/asesores/add')}
          testID="add-asesor-button"
        >
          <Ionicons name="add-circle" size={32} color="#E63946" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      ) : asesores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Aún no hay asesores</Text>
          <Text style={styles.emptyHint}>
            Agrega un asesor por provincia para enrutar los WhatsApp correctamente
          </Text>
          <TouchableOpacity
            style={styles.addBtnLarge}
            onPress={() => router.push('/admin/asesores/add')}
          >
            <Text style={styles.addBtnLargeText}>Agregar primer asesor</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={asesores}
          renderItem={renderAsesor}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 18, fontWeight: '800', color: '#0A1F44' },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1 },
  nombre: { fontSize: 15, fontWeight: '800', color: '#0A1F44', marginBottom: 4 },
  rowInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  provincia: { fontSize: 12, color: '#666', fontWeight: '600' },
  whatsapp: { fontSize: 12, color: '#1a1a1a', fontWeight: '600' },
  actions: { gap: 6 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffe6e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 18, color: '#1a1a1a', marginTop: 16, fontWeight: '700' },
  emptyHint: { fontSize: 13, color: '#666', marginTop: 8, marginBottom: 24, textAlign: 'center', lineHeight: 18 },
  addBtnLarge: {
    backgroundColor: '#E63946',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  addBtnLargeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
