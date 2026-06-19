import React, { useEffect, useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Botón flotante "Agregar a pantalla de inicio" que aparece en navegadores
 * que soportan el evento `beforeinstallprompt` (Chrome / Edge / Brave / Samsung
 * Internet en Android, y Chrome desktop). En iOS Safari se muestra una nota
 * con instrucciones manuales porque iOS no expone beforeinstallprompt.
 *
 * Solo se renderiza en Web. En nativo se vuelve no-op.
 */
const STORAGE_KEY = 'pwa_install_dismissed_at';
const REMIND_AFTER_MS = 1000 * 60 * 60 * 24 * 3; // 3 días

const isStandalone = (): boolean => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  // @ts-ignore - Safari iOS standalone
  if (window.navigator?.standalone) return true;
  return window.matchMedia?.('(display-mode: standalone)')?.matches === true;
};

const isIOSWeb = (): boolean => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const ua = window.navigator?.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
};

const PWAInstallPrompt: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'native' | 'ios'>('native');
  const slide = useState(new Animated.Value(120))[0];

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (isStandalone()) return; // ya instalada

    // Check dismissal cooldown
    try {
      const dismissedAt = window.localStorage?.getItem(STORAGE_KEY);
      if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < REMIND_AFTER_MS) {
        return;
      }
    } catch {}

    const showPrompt = (m: 'native' | 'ios') => {
      setMode(m);
      setVisible(true);
      Animated.timing(slide, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    };

    // Android / Desktop Chrome / Edge / Brave
    const onAvailable = () => showPrompt('native');

    // Si ya disparó el evento antes de montar el componente, leer la var global
    if ((window as any).__pwaInstallPrompt) {
      showPrompt('native');
    }

    window.addEventListener('pwa-install-available', onAvailable);

    const onInstalled = () => {
      setVisible(false);
      try {
        window.localStorage?.removeItem(STORAGE_KEY);
      } catch {}
    };
    window.addEventListener('pwa-installed', onInstalled);

    // iOS Safari - mostrar instrucciones manuales tras 2.5 s
    let iosTimer: any = null;
    if (isIOSWeb() && !(window as any).__pwaInstallPrompt) {
      iosTimer = setTimeout(() => showPrompt('ios'), 2500);
    }

    return () => {
      window.removeEventListener('pwa-install-available', onAvailable);
      window.removeEventListener('pwa-installed', onInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, [slide]);

  const handleInstall = async () => {
    if (mode !== 'native') return;
    const deferred = typeof window !== 'undefined' ? (window as any).__pwaInstallPrompt : null;
    if (!deferred) {
      hide();
      return;
    }
    try {
      deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice?.outcome === 'accepted') {
        // El evento `appinstalled` cerrará el prompt
        (window as any).__pwaInstallPrompt = null;
      } else {
        hide();
      }
    } catch {
      hide();
    }
  };

  const hide = (persist = true) => {
    Animated.timing(slide, {
      toValue: 200,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
    if (persist && typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem(STORAGE_KEY, String(Date.now()));
      } catch {}
    }
  };

  if (Platform.OS !== 'web' || !visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slide }] }]} pointerEvents="box-none">
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons name="phone-portrait" size={26} color="#fff" />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Instala Tohatsu Motors</Text>
          {mode === 'native' ? (
            <Text style={styles.subtitle}>
              Agrégala a tu pantalla de inicio y úsala como una app nativa.
            </Text>
          ) : (
            <Text style={styles.subtitle}>
              Toca <Text style={styles.bold}>Compartir</Text> y luego{' '}
              <Text style={styles.bold}>«Agregar a pantalla de inicio»</Text>.
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          {mode === 'native' && (
            <TouchableOpacity onPress={handleInstall} style={styles.installBtn} testID="pwa-install-button">
              <Ionicons name="download" size={16} color="#fff" />
              <Text style={styles.installText}>Instalar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => hide(true)} style={styles.dismissBtn} testID="pwa-dismiss-button">
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1628',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E63946',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: { flex: 1, minWidth: 0 },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 16,
  },
  bold: { fontWeight: '800', color: '#fff' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  installBtn: {
    backgroundColor: '#E63946',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  installText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  dismissBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export default PWAInstallPrompt;
