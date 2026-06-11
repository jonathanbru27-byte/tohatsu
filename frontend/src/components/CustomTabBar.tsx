import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: 'Inicio', path: '/', icon: 'home' as const, iconOutline: 'home-outline' as const },
    { name: 'Motores', path: '/client', icon: 'compass' as const, iconOutline: 'compass-outline' as const },
    { name: 'Servicio', path: '/client/contact', icon: 'calendar' as const, iconOutline: 'calendar-outline' as const },
    { name: 'Admin', path: '/admin/login', icon: 'settings' as const, iconOutline: 'settings-outline' as const },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path === '/client') return pathname === '/client' || pathname.startsWith('/client/motor');
    if (path === '/client/contact') return pathname === '/client/contact' || pathname === '/client/calendar';
    if (path === '/admin/login') return pathname.startsWith('/admin');
    return false;
  };

  return (
    <View style={styles.container} testID="bottom-tab-bar">
      {tabs.map((tab) => {
        const active = isActive(tab.path);
        return (
          <TouchableOpacity
            key={tab.path}
            style={styles.tab}
            onPress={() => router.push(tab.path as any)}
            testID={`tab-${tab.name.toLowerCase()}`}
          >
            <Ionicons
              name={active ? tab.icon : tab.iconOutline}
              size={26}
              color={active ? '#E63946' : '#999'}
            />
            <Text style={[styles.label, active && styles.labelActive]}>
              {tab.name.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    paddingBottom: 12,
    height: 68,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: '#E63946',
  },
});
