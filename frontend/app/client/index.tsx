import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CatalogoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>HOLA CATALOGO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
});
