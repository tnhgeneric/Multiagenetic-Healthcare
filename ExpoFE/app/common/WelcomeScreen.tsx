import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './WelcomeScreen.styles';
import { useRouter } from 'expo-router';

export default function WelcomeScreen(/*{ navigation }: any*/) {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundGradient} />
      <View style={styles.backgroundOverlay} />

      <View style={styles.logoContainer}>
        <View style={styles.logoWrapper}>
          <Image source={require('../../assets/images/logo.png')} style={styles.heartIcon} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.walkthroughContainer}>
          <View style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.walkthroughImage}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.slideTitle}>Welcome to CareFlow</Text>
            <Text style={styles.slideDescription}>
              Smart, connected patient journeys and multi-agent orchestration for better outcomes.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(tabs)')} >
            <Text style={styles.loginButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.createAccountButton} onPress={() => router.push('/(tabs)')} >
            <Text style={styles.createAccountButtonText}>Try Demo</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our <Text style={styles.linkText}>Terms</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </View>
      </View>

      {/* Agentic chat floating button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 24,
          bottom: 140,
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#6B4EAE',
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 4,
        }}
        onPress={() => router.push('/common/AgentChat')}
      >
        <Image source={require('../../assets/images/icon.png')} style={{ width: 36, height: 36, tintColor: '#fff' }} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}