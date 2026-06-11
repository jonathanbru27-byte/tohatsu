import React, { useState, useEffect } from 'react';
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
  Linking,
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
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'ventas' | 'repuestos' | 'servicio'>('ventas');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [motorsData, configData] = await Promise.all([getMotors(), getConfig()]);
      setMotors(motorsData);
      setConfig(configData);
      if (motorsData.length > 0 && !selectedMotor) {
        setSelectedMotor(motorsData[0]);
      }
    } catch (error) {
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

  const calcularCuotaMensual = (motor: Motor) => {
    const montoFinanciado = motor.precio - motor.financiamiento_entrada;
    return Math.round(montoFinanciado / motor.financiamiento_cuotas);
  };

  const openContactModal = (type: 'ventas' | 'repuestos' | 'servicio') => {
    setModalType(type);
    setModalVisible(true);
  };

  const getModalData = () => {
    if (!config) return { title: '', phone: '' };
    switch (modalType) {
      case 'ventas':
        return { title: 'Cotización de Motor', phone: config.whatsapp_ventas };
      case 'repuestos':
        return { title: 'Pedido de Repuestos', phone: config.whatsapp_repuestos };
      case 'servicio':
        return { title: 'Servicio Técnico', phone: config.whatsapp_servicio };
    }
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

  if (motors.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="boat-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No hay motores disponibles</Text>
        </View>
        <CustomTabBar />
      </SafeAreaView>
    );
  }

  const motor = selectedMotor || motors[0];
  const modalData = getModalData();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />}
      >
        {/* HP Filter Chips */}
        <View style={styles.chipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
          >
            {motors.map((m) => {
              const isSelected = motor.id === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedMotor(m)}
                  testID={`chip-${m.hp_value}hp`}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {m.potencia}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Motor Image Card */}
        <View style={styles.imageCard}>
          <Image source={{ uri: motor.imagen }} style={styles.motorImage} resizeMode="cover" />
          {motor.badge_text && (
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>{motor.badge_text}</Text>
            </View>
          )}
        </View>

        {/* Motor Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.motorTitle}>{motor.modelo}</Text>
              {motor.tipo ? <Text style={styles.motorSubtitle}>{motor.tipo}</Text> : null}
            </View>
            <View style={styles.hpBadge}>
              <Text style={styles.hpBadgeText}>{motor.potencia}</Text>
            </View>
          </View>

          {/* Specs */}
          <View style={styles.specsContainer}>
            <View style={styles.specCard}>
              <Text style={styles.specLabel}>CILINDRADA</Text>
              <Text style={styles.specValue}>{motor.cilindrada || '-'}</Text>
            </View>
            <View style={styles.specCard}>
              <Text style={styles.specLabel}>PESO SECO</Text>
              <Text style={styles.specValue}>{motor.peso_seco || '-'}</Text>
            </View>
            <View style={styles.specCard}>
              <Text style={styles.specLabel}>SISTEMA</Text>
              <Text style={styles.specValue}>{motor.sistema || '-'}</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>PRECIO REF.</Text>
              <Text style={styles.priceValue}>
                ${motor.precio.toLocaleString()} <Text style={styles.priceCurrency}>USD</Text>
              </Text>
            </View>
            <View style={[styles.priceBlock, styles.priceBlockRight]}>
              <Text style={styles.priceLabel}>CUOTA ESTIMADA</Text>
              <Text style={styles.priceQuota}>
                ${calcularCuotaMensual(motor).toLocaleString()} <Text style={styles.priceQuotaSmall}>/mes</Text>
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.calcButton}
              onPress={() => router.push(`/client/motor/${motor.id}` as any)}
              testID="calc-plan-button"
            >
              <Ionicons name="calculator-outline" size={20} color="#E63946" />
              <Text style={styles.calcButtonText}>Calcular Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cotizarButton}
              onPress={() => openContactModal('ventas')}
              testID="cotizar-button"
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.cotizarButtonText}>COTIZAR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Servicios y Repuestos Section */}
        <View style={styles.sectionTitle}>
          <View style={styles.sectionTitleBar} />
          <Text style={styles.sectionTitleText}>SERVICIOS Y REPUESTOS</Text>
        </View>

        <TouchableOpacity
          style={styles.serviceCard}
          onPress={() => openContactModal('servicio')}
          testID="service-tecnico-card"
        >
          <View style={styles.serviceIcon}>
            <Ionicons name="build" size={28} color="#E67E22" />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>SERVICIO TÉCNICO</Text>
            <Text style={styles.serviceDescription}>
              Atención rápida y especializada para tu motor
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.repuestosCard}
          onPress={() => openContactModal('repuestos')}
          testID="repuestos-card"
        >
          <View style={styles.serviceIcon}>
            <Ionicons name="construct" size={28} color="#27AE60" />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>REPUESTOS ORIGINALES</Text>
            <Text style={styles.serviceDescription}>
              Repuestos genuinos Tohatsu para tu motor
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={{ height: 16 }} />
      </ScrollView>

      <CustomTabBar />

      <ContactModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalData.title}
        phoneNumber={modalData.phone}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F4',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  chipsContainer: {
    backgroundColor: '#F2F2F4',
    paddingVertical: 12,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  chipSelected: {
    backgroundColor: '#FFE5E8',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
  },
  chipTextSelected: {
    color: '#E63946',
  },
  imageCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  motorImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#e0e0e0',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E63946',
  },
  imageBadgeText: {
    color: '#E63946',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  infoSection: {
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  motorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  motorSubtitle: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  hpBadge: {
    backgroundColor: '#FFE5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  hpBadgeText: {
    color: '#E63946',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  specsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    gap: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  specCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  specValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  priceContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priceBlock: {
    flex: 1,
  },
  priceBlockRight: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  priceCurrency: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  priceQuota: {
    fontSize: 22,
    fontWeight: '800',
    color: '#27AE60',
  },
  priceQuotaSmall: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  calcButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#f0f0f0',
  },
  calcButtonText: {
    color: '#E63946',
    fontSize: 14,
    fontWeight: '700',
  },
  cotizarButton: {
    flex: 1.5,
    backgroundColor: '#E63946',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cotizarButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
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
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 1.5,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB366',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 18,
    gap: 16,
    shadowColor: '#E67E22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  repuestosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#66D9A0',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 18,
    gap: 16,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.95,
    fontWeight: '500',
  },
});
