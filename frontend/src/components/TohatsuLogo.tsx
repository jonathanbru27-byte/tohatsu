import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const LOGO_URL =
  'https://customer-assets.emergentagent.com/job_outboard-dealer-app/artifacts/xhb5qngr_images.jpg';

interface TohatsuLogoProps {
  size?: number;
  color?: 'navy' | 'white';
}

export default function TohatsuLogo({ size = 80, color = 'navy' }: TohatsuLogoProps) {
  const mainColor = color === 'navy' ? '#0A1F44' : '#ffffff';

  return (
    <View style={styles.container}>
      <View style={[styles.logoRow, { gap: size * 0.18 }]}>
        <Image
          source={{ uri: LOGO_URL }}
          style={{
            width: size,
            height: size,
            resizeMode: 'contain',
          }}
        />
        <Text
          style={[
            styles.brandText,
            {
              fontSize: size * 0.55,
              color: mainColor,
              letterSpacing: size * 0.02,
            },
          ]}
        >
          TOHATSU
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontWeight: '900',
    fontFamily: 'System',
  },
});
