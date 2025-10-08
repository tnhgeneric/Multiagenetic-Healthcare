import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './WelcomeScreen.styles';

// Clean single-component Welcome screen. Kept minimal so the project compiles.
export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '600' }}>Welcome</Text>
      </View>
    </SafeAreaView>
  );
}