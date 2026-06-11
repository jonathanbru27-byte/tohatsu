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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getRepuestos, deleteRepuesto, Repuesto } from '@/src/services/api';

export default function RepuestosAdminScreen() {
  const router = useRouter();
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRepuestos();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadRepuestos();
    }, [])
  );

  const loadRepuestos = async () => {
    try {
      const data = await getRepuestos();
      setRepuestos(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los repuestos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, nombre: string) => {
    Alert.alert('Confirmar', `¿Eliminar el repuesto "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRepuesto(id);
            loadRepuestos();
            Alert.alert('Éxito', 'Repuesto eliminado');
          } catch {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  const renderRepuesto = ({ item }: { item: Repuesto }) => (
    <View style={styles.card} testID={`admin-repuesto-${item.id}`}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="construct" size={28} color="#0A1F44" />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={1}>{item.nombre}</Text>
        <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>
        <View style={styles.row}>
          <Text style={styles.precio}>${item.precio.toLocaleString()}</Text>
          {item.categoria ? (
            <View style={styles.categoriaBadge}>
              <Text style={styles.categoriaText}>{item.categoria}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push(`/admin/repuestos/edit/${item.id}` as any)}
          testID={`edit-${item.id}`}
        >
          <Ionicons name="create" size={18} color="#0A1F44" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id!, item.nombre)}
          testID={`delete-${item.id}`}
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
        <Text style={styles.title}>Gestionar Repuestos</Text>
        <TouchableOpacity
          onPress={() => router.push('/admin/repuestos/add')}
          testID="add-repuesto-button"
        >
          <Ionicons name="add-circle" size={32} color="#E63946" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      ) : repuestos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No hay repuestos</Text>
          <TouchableOpacity
            style={styles.addBtnLarge}
            onPress={() => router.push('/admin/repuestos/add')}
          >
            <Text style={styles.addBtnLargeText}>Agregar primer repuesto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={repuestos}
          renderItem={renderRepuesto}
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
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#E8F0FF',
  },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  nombre: { fontSize: 14, fontWeight: '700', color: '#0A1F44', marginBottom: 2 },
  descripcion: { fontSize: 11, color: '#666', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  precio: { fontSize: 15, fontWeight: '800', color: '#E63946' },
  categoriaBadge: {
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoriaText: { fontSize: 9, fontWeight: '700', color: '#0A1F44' },
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
  emptyText: { fontSize: 18, color: '#666', marginTop: 16, marginBottom: 24 },
  addBtnLarge: {
    backgroundColor: '#E63946',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  addBtnLargeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
