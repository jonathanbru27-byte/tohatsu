import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMotors, getCalendar, Motor, CalendarioEvento } from '@/src/services/api';
import CustomTabBar from '@/src/components/CustomTabBar';

export default function HomeScreen() {
  const router = useRouter();
  const [motors, setMotors] = useState<Motor[]>([]);
  const [eventos, setEventos] = useState<CalendarioEvento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [motorsData, eventosData] = await Promise.all([getMotors(), getCalendar()]);
      setMotors(motorsData.slice(0, 3));
      // Filtrar próximos (futuros) y ordenar cronológicamente
      const today = new Date().toISOString().split('T')[0];
      const upcoming = eventosData
        .filter((e) => e.fecha >= today)
        .sort((a, b) => a.fecha.localeCompare(b.fecha));
      setEventos(upcoming);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Fixed Compact Navbar */}
      <View style={styles.navbar} testID="top-navbar">
        <Image
          source={{ uri: 'https://customer-assets.emergentagent.com/job_outboard-dealer-app/artifacts/xhb5qngr_images.jpg' }}
          style={styles.navbarLogo}
          resizeMode="contain"
        />
        <Text style={styles.navbarBrand}>TOHATSU</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Hero Section (sin logo grande) */}
        <View style={styles.navyHeader}>
          <Text style={styles.heroSubtitle}>MOTORES FUERA DE BORDA</Text>
          <Text style={styles.heroTitle}>Calidad Japonesa</Text>
          <Text style={styles.heroDescription}>
            Más de 60 años de innovación marina al servicio de tu navegación
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push('/client')}
            testID="hero-explore-button"
          >
            <Text style={styles.heroButtonText}>EXPLORAR CATÁLOGO</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          {/* Próximas Campañas de Mantenimiento */}
          {eventos.length > 0 && (
            <View style={styles.campaignsSection}>
              <View style={styles.campaignsHeader}>
                <Ionicons name="megaphone" size={16} color="#E63946" />
                <Text style={styles.campaignsHeaderText}>PRÓXIMAS CAMPAÑAS GRATUITAS</Text>
              </View>
              {eventos.slice(0, 3).map((ev, idx) => (
                <TouchableOpacity
                  key={ev.id}
                  style={[styles.campaignCard, idx === 0 && styles.campaignCardFeatured]}
                  onPress={() => router.push('/client/calendar')}
                  testID={`campaign-${ev.id}`}
                >
                  <View style={styles.campaignDateBox}>
                    <Text style={styles.campaignDay}>
                      {ev.fecha.split('-')[2] || '--'}
                    </Text>
                    <Text style={styles.campaignMonth}>
                      {['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][
                        parseInt(ev.fecha.split('-')[1] || '1', 10) - 1
                      ] || ''}
                    </Text>
                  </View>
                  <View style={styles.campaignBody}>
                    {ev.titulo ? (
                      <Text style={styles.campaignTitle} numberOfLines={1}>
                        {ev.titulo}
                      </Text>
                    ) : (
                      <Text style={styles.campaignTitle} numberOfLines={1}>
                        Mantenimiento Gratuito
                      </Text>
                    )}
                    <View style={styles.campaignMetaRow}>
                      {ev.hora ? (
                        <>
                          <Ionicons name="time-outline" size={11} color="#B8C5DB" />
                          <Text style={styles.campaignMeta}>{ev.hora}</Text>
                          <View style={styles.dotSep} />
                        </>
                      ) : null}
                      <Ionicons name="location-outline" size={11} color="#B8C5DB" />
                      <Text style={styles.campaignMeta} numberOfLines={1}>
                        {ev.localidad}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#B8C5DB" />
                </TouchableOpacity>
              ))}
              {eventos.length > 3 && (
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => router.push('/client/calendar')}
                  testID="view-all-campaigns"
                >
                  <Text style={styles.viewAllText}>
                    Ver todas las campañas ({eventos.length})
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.sectionTitle}>
            <View style={styles.sectionTitleBar} />
            <Text style={styles.sectionTitleText}>ACCIONES RÁPIDAS</Text>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/client')}
              testID="action-motors"
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFE5E8' }]}>
                <Ionicons name="boat" size={26} color="#E63946" />
              </View>
              <Text style={styles.actionText}>Motores</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/client/repuestos')}
              testID="action-repuestos"
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E8F0FF' }]}>
                <Ionicons name="construct" size={26} color="#0A1F44" />
              </View>
              <Text style={styles.actionText}>Repuestos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/client/contact')}
              testID="action-contact"
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="call" size={26} color="#E67E22" />
              </View>
              <Text style={styles.actionText}>Contactar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/client/calendar')}
              testID="action-calendar"
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="calendar" size={26} color="#27AE60" />
              </View>
              <Text style={styles.actionText}>Calendario</Text>
            </TouchableOpacity>
          </View>

          {/* Repuestos Banner */}
          <TouchableOpacity
            style={styles.repuestosBanner}
            onPress={() => router.push('/client/repuestos')}
            testID="repuestos-banner"
          >
            <View style={styles.repuestosIcon}>
              <Ionicons name="construct" size={36} color="#fff" />
            </View>
            <View style={styles.repuestosInfo}>
              <Text style={styles.repuestosTitle}>CATÁLOGO DE REPUESTOS</Text>
              <Text style={styles.repuestosDesc}>
                Repuestos originales Tohatsu con stock disponible
              </Text>
            </View>
            <View style={styles.repuestosArrow}>
              <Ionicons name="arrow-forward" size={20} color="#0A1F44" />
            </View>
          </TouchableOpacity>

          {/* Featured Motors */}
          <View style={styles.sectionTitle}>
            <View style={styles.sectionTitleBar} />
            <Text style={styles.sectionTitleText}>MODELOS DESTACADOS</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#E63946" style={{ marginVertical: 40 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredContainer}
            >
              {motors.map((motor) => (
                <TouchableOpacity
                  key={motor.id}
                  style={styles.featuredCard}
                  onPress={() => router.push(`/client/motor/${motor.id}` as any)}
                  testID={`featured-${motor.id}`}
                >
                  <Image source={{ uri: motor.imagen }} style={styles.featuredImage} resizeMode="cover" />
                  <View style={styles.featuredHpBadge}>
                    <Text style={styles.featuredHpText}>{motor.potencia}</Text>
                  </View>
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredTitle} numberOfLines={1}>{motor.modelo}</Text>
                    <Text style={styles.featuredPrice}>${motor.precio.toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>

      <CustomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F2F2F4',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a1628',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  navbarLogo: {
    width: 32,
    height: 32,
  },
  navbarBrand: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  navyHeader: {
    backgroundColor: '#0a1628',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  campaignsSection: {
    marginTop: 24,
  },
  campaignsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  campaignsHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E63946',
    letterSpacing: 1.5,
  },
  campaignCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  campaignCardFeatured: {
    backgroundColor: 'rgba(230, 57, 70, 0.15)',
    borderColor: 'rgba(230, 57, 70, 0.4)',
  },
  campaignDateBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E63946',
    justifyContent: 'center',
    alignItems: 'center',
  },
  campaignDay: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 24,
  },
  campaignMonth: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  campaignBody: {
    flex: 1,
  },
  campaignTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  campaignMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  campaignMeta: {
    fontSize: 11,
    color: '#B8C5DB',
    fontWeight: '500',
  },
  dotSep: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#B8C5DB',
    marginHorizontal: 4,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#E63946',
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 13,
    color: '#B8C5DB',
    lineHeight: 20,
    marginBottom: 20,
  },
  heroButton: {
    backgroundColor: '#E63946',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  body: {
    backgroundColor: '#F2F2F4',
    paddingTop: 24,
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
    color: '#0A1F44',
    letterSpacing: 1.5,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A1F44',
    textAlign: 'center',
  },
  repuestosBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1F44',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    shadowColor: '#0A1F44',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  repuestosIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  repuestosInfo: {
    flex: 1,
  },
  repuestosTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  repuestosDesc: {
    fontSize: 12,
    color: '#B8C5DB',
    fontWeight: '500',
  },
  repuestosArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContainer: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 8,
  },
  featuredCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  featuredImage: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: '#e0e0e0',
  },
  featuredHpBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E63946',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredHpText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  featuredInfo: {
    padding: 12,
  },
  featuredTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A1F44',
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E63946',
  },
});
