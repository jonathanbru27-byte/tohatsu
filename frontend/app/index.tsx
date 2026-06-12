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
import { getMotors, Motor } from '@/src/services/api';
import CustomTabBar from '@/src/components/CustomTabBar';
import TohatsuLogo from '@/src/components/TohatsuLogo';

export default function HomeScreen() {
  const router = useRouter();
  const [motors, setMotors] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMotors();
  }, []);

  const loadMotors = async () => {
    try {
      const data = await getMotors();
      setMotors(data.slice(0, 3));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Navy Header with Logo */}
        <View style={styles.navyHeader}>
          <View style={styles.logoContainer}>
            <TohatsuLogo size={64} showTagline color="white" />
          </View>
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
    backgroundColor: '#0A1F44',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F2F2F4',
  },
  navyHeader: {
    backgroundColor: '#0A1F44',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
