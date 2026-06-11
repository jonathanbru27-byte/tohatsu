import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomTabBar from '@/src/components/CustomTabBar';

interface ClientScreenContainerProps {
  title: string;
  children: React.ReactNode;
  showBack?: boolean;
  hideTabs?: boolean;
}

export default function ClientScreenContainer({
  title,
  children,
  showBack = false,
  hideTabs = false,
}: ClientScreenContainerProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} testID="back-button">
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={styles.content}>{children}</View>
      {!hideTabs && <CustomTabBar />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
});
