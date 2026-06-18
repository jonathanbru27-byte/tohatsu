import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getRepuestos, getConfig, Repuesto, Configuracion } from '@/src/services/api';
import CustomTabBar from '@/src/components/CustomTabBar';
import ContactModal from '@/src/components/ContactModal';

const CATEGORIA_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Filtros: 'funnel',
  Encendido: 'flash',
  Refrigeración: 'snow',
  Lubricantes: 'water',
  Hélices: 'sync',
  Protección: 'shield-checkmark',
  Combustible: 'flame',
  Mandos: 'speedometer',
  General: 'construct',
};

export default function RepuestosScreen() {
  const router = useRouter();
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRepuesto, setSelectedRepuesto] = useState<Repuesto | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [repuestosData, configData] = await Promise.all([getRepuestos(), getConfig()]);
      setRepuestos(repuestosData);
      setConfig(configData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los repuestos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCotizar = (repuesto: Repuesto) => {
    setSelectedRepuesto(repuesto);
    setModalVisible(true);
  };

  const renderRepuesto = ({ item }: { item: Repuesto }) => {
    const iconName = CATEGORIA_ICONS[item.categoria || 'General'] || 'construct';
    return (
      <View style={styles.card} testID={`repuesto-${item.id}`}>
        <View style={styles.iconBox}>
          <Ionicons name={iconName} size={28} color="#0A1F44" />
        </View>
        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text style={styles.nombre} numberOfLines={1}>{item.nombre}</Text>
            {item.categoria ? (
              <View style={styles.categoriaBadge}>
                <Text style={styles.categoriaText}>{item.categoria}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>
          <View style={styles.footerRow}>
            <View>
              <Text style={styles.precioLabel}>PRECIO REF.</Text>
              <Text style={styles.precio}>${item.precio.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              style={styles.cotizarBtn}
              onPress={() => handleCotizar(item)}
              testID={`cotizar-${item.id}`}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={styles.cotizarText}>COTIZAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-button">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>REPUESTOS</Text>
          <Text style={styles.headerSubtitle}>Originales Tohatsu</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      ) : repuestos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No hay repuestos disponibles</Text>
        </View>
      ) : (
        <FlatList
          data={repuestos}
          renderItem={renderRepuesto}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />}
        />
      )}

      <CustomTabBar />

      {selectedRepuesto && (
        <ContactModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedRepuesto(null);
          }}
          title={`Repuesto: ${selectedRepuesto.nombre}`}
          phoneNumber={config?.whatsapp_repuestos || ''}
          interes="repuesto"
          detalle={`${selectedRepuesto.nombre} - $${selectedRepuesto.precio} (${selectedRepuesto.categoria || 'General'})`}
        />
      )}
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
    alignItems: 'center',
    backgroundColor: '#0A1F44',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#B8C5DB',
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
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
    textAlign: 'center',
  },
  list: {
    padding: 16,
    paddingTop: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  nombre: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0A1F44',
  },
  categoriaBadge: {
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoriaText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0A1F44',
    letterSpacing: 0.3,
  },
  descripcion: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  precioLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  precio: {
    fontSize: 18,
    fontWeight: '900',
    color: '#E63946',
    marginTop: 2,
  },
  cotizarBtn: {
    backgroundColor: '#25D366',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cotizarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
