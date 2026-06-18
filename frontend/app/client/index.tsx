import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMotors, getConfig, Motor, Configuracion } from '@/src/services/api';
import CustomTabBar from '@/src/components/CustomTabBar';
import ContactModal from '@/src/components/ContactModal';

export default function MotoresScreen() {
  const router = useRouter();
  const [motors, setMotors] = useState<Motor[]>([]);
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedHp, setSelectedHp] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [motorsData, configData] = await Promise.all([getMotors(), getConfig()]);
      setMotors(motorsData);
      setConfig(configData);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredMotors = useMemo(() => {
    if (selectedHp === null) return motors;
    return motors.filter((m) => (m.hp_value || 0) === selectedHp);
  }, [motors, selectedHp]);

  const hpOptions = useMemo(() => {
    const unique = Array.from(new Set(motors.map((m) => m.hp_value || 0))).sort((a, b) => b - a);
    return unique;
  }, [motors]);

  const handleCotizar = (motor: Motor) => {
    setSelectedMotor(motor);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <>
      {/* Title */}
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>Catálogo Motores</Text>
        <Text style={styles.pageSubtitle}>
          {filteredMotors.length} {filteredMotors.length === 1 ? 'modelo disponible' : 'modelos disponibles'}
        </Text>
      </View>

      {/* HP Filter Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
        >
          <TouchableOpacity
            style={[styles.chip, selectedHp === null && styles.chipSelected]}
            onPress={() => setSelectedHp(null)}
            testID="chip-todos"
          >
            <Text style={[styles.chipText, selectedHp === null && styles.chipTextSelected]}>
              TODOS
            </Text>
          </TouchableOpacity>
          {hpOptions.map((hp) => (
            <TouchableOpacity
              key={hp}
              style={[styles.chip, selectedHp === hp && styles.chipSelected]}
              onPress={() => setSelectedHp(hp)}
              testID={`chip-${hp}hp`}
            >
              <Text style={[styles.chipText, selectedHp === hp && styles.chipTextSelected]}>
                {hp} HP
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );

  const renderMotor = ({ item }: { item: Motor }) => (
    <TouchableOpacity
      style={styles.motorCard}
      onPress={() => router.push(`/client/motor/${item.id}` as any)}
      testID={`motor-card-${item.id}`}
      activeOpacity={0.9}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.imagen }} style={styles.motorImage} resizeMode="cover" />
        {item.badge_text ? (
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>{item.badge_text}</Text>
          </View>
        ) : null}
        <View style={styles.hpBadge}>
          <Text style={styles.hpBadgeText}>{item.potencia}</Text>
        </View>
      </View>

      <View style={styles.motorBody}>
        <Text style={styles.motorTitle} numberOfLines={1}>{item.modelo}</Text>
        {item.tipo ? <Text style={styles.motorTipo} numberOfLines={1}>{item.tipo}</Text> : null}

        {/* Mini specs */}
        <View style={styles.specsRow}>
          {item.cilindrada ? (
            <View style={styles.specPill}>
              <Ionicons name="hardware-chip-outline" size={12} color="#0A1F44" />
              <Text style={styles.specPillText}>{item.cilindrada}</Text>
            </View>
          ) : null}
          {item.peso_seco ? (
            <View style={styles.specPill}>
              <Ionicons name="scale-outline" size={12} color="#0A1F44" />
              <Text style={styles.specPillText}>{item.peso_seco}</Text>
            </View>
          ) : null}
          {item.sistema ? (
            <View style={styles.specPill}>
              <Ionicons name="flash-outline" size={12} color="#0A1F44" />
              <Text style={styles.specPillText}>{item.sistema}</Text>
            </View>
          ) : null}
        </View>

        {/* Prices */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>PRECIO REF.</Text>
            <Text style={styles.priceValue}>${item.precio.toLocaleString()}</Text>
          </View>
          <View style={styles.priceSeparator} />
          <View>
            <Text style={styles.priceLabel}>ENTRADA MÍN.</Text>
            <Text style={styles.priceQuota}>${item.financiamiento_entrada.toLocaleString()}</Text>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.detalleBtn}
            onPress={() => router.push(`/client/motor/${item.id}` as any)}
          >
            <Ionicons name="eye-outline" size={16} color="#0A1F44" />
            <Text style={styles.detalleBtnText}>Ver detalles</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cotizarBtn}
            onPress={() => handleCotizar(item)}
            testID={`cotizar-${item.id}`}
          >
            <Ionicons name="call" size={16} color="#fff" />
            <Text style={styles.cotizarBtnText}>COTIZAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <View style={styles.sectionTitle}>
        <View style={styles.sectionTitleBar} />
        <Text style={styles.sectionTitleText}>SERVICIOS Y REPUESTOS</Text>
      </View>

      <TouchableOpacity
        style={[styles.serviceCard, { backgroundColor: '#E67E22' }]}
        onPress={() => router.push('/client/contact')}
      >
        <View style={styles.serviceIcon}>
          <Ionicons name="build" size={26} color="#E67E22" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.serviceTitle}>SERVICIO TÉCNICO</Text>
          <Text style={styles.serviceDesc}>Atención rápida y especializada</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.serviceCard, { backgroundColor: '#0A1F44' }]}
        onPress={() => router.push('/client/repuestos')}
      >
        <View style={styles.serviceIcon}>
          <Ionicons name="construct" size={26} color="#0A1F44" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.serviceTitle}>REPUESTOS ORIGINALES</Text>
          <Text style={styles.serviceDesc}>Catálogo completo Tohatsu</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={{ height: 12 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredMotors}
        renderItem={renderMotor}
        keyExtractor={(item) => item.id!}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="boat-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay motores en esta categoría</Text>
          </View>
        }
      />

      <CustomTabBar />

      <ContactModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={selectedMotor ? `Cotización ${selectedMotor.modelo}` : 'Cotización'}
        phoneNumber={config?.whatsapp_ventas || ''}
        interes="motor"
        detalle={
          selectedMotor
            ? `Motor: ${selectedMotor.modelo} (${selectedMotor.potencia}) - Precio ref. $${selectedMotor.precio.toLocaleString()}`
            : ''
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F4' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 16 },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A1F44',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    fontWeight: '500',
  },
  chipsContainer: { paddingVertical: 8, marginBottom: 8 },
  chipsContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  chipSelected: {
    backgroundColor: '#E63946',
    borderColor: '#E63946',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#888',
    letterSpacing: 0.5,
  },
  chipTextSelected: { color: '#fff' },
  motorCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrap: {
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  motorImage: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: '#e0e0e0',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E63946',
  },
  imageBadgeText: {
    color: '#E63946',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  hpBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#E63946',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  hpBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  motorBody: { padding: 16 },
  motorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A1F44',
    marginBottom: 2,
  },
  motorTipo: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    marginBottom: 12,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A1F44',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  priceSeparator: {
    width: 1,
    height: 32,
    backgroundColor: '#e0e0e0',
  },
  priceLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A1F44',
  },
  priceQuota: {
    fontSize: 16,
    fontWeight: '900',
    color: '#27AE60',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detalleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F2F4F8',
    paddingVertical: 12,
    borderRadius: 22,
  },
  detalleBtnText: {
    color: '#0A1F44',
    fontSize: 12,
    fontWeight: '700',
  },
  cotizarBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E63946',
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  cotizarBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  footer: { paddingTop: 12 },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitleBar: {
    width: 24,
    height: 3,
    backgroundColor: '#E63946',
    borderRadius: 2,
  },
  sectionTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A1F44',
    letterSpacing: 1.5,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.95,
    fontWeight: '500',
  },
});
