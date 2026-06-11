import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';

interface TohatsuLogoProps {
  size?: number;
  showTagline?: boolean;
  color?: 'navy' | 'white';
}

export default function TohatsuLogo({ size = 80, showTagline = false, color = 'navy' }: TohatsuLogoProps) {
  const mainColor = color === 'navy' ? '#0A1F44' : '#ffffff';
  const accentColor = color === 'navy' ? '#7A8FA8' : '#E8EEF7';

  return (
    <View style={styles.container}>
      <View style={[styles.logoRow, { gap: size * 0.15 }]}>
        {/* Logo Mark - Stylized T inside Ellipse */}
        <Svg width={size * 0.85} height={size} viewBox="0 0 100 120">
          <Defs>
            <LinearGradient id="ellipseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={accentColor} stopOpacity="0.8" />
              <Stop offset="50%" stopColor={mainColor} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={accentColor} stopOpacity="0.8" />
            </LinearGradient>
          </Defs>
          {/* Outer ellipse (silver chrome) */}
          <Ellipse
            cx="50"
            cy="60"
            rx="42"
            ry="55"
            stroke="url(#ellipseGrad)"
            strokeWidth="3"
            fill="none"
          />
          {/* Stylized T - top horizontal bar */}
          <Path
            d="M 22 30 L 78 30 L 78 50 L 60 50 L 60 110 L 40 110 L 40 50 L 22 50 Z"
            fill={mainColor}
          />
        </Svg>

        {/* TOHATSU Text */}
        <View style={styles.textContainer}>
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
          {showTagline && (
            <Text
              style={[
                styles.tagline,
                {
                  fontSize: size * 0.16,
                  color: mainColor,
                },
              ]}
            >
              Feel the Wind™
            </Text>
          )}
        </View>
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
  textContainer: {
    justifyContent: 'center',
  },
  brandText: {
    fontWeight: '900',
    fontFamily: 'System',
  },
  tagline: {
    fontStyle: 'italic',
    fontWeight: '400',
    marginTop: 2,
  },
});
