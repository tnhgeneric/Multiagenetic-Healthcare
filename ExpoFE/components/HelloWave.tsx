import { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

export function HelloWave() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.timing(rotation, { toValue: 25, duration: 150, useNativeDriver: true }),
      Animated.timing(rotation, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]);

    Animated.loop(sequence, { iterations: 4 }).start();
  }, [rotation]);

  const animatedStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  } as any;

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
