import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './WelcomeScreen.styles';
import Constants from 'expo-constants';

const resolveBackendUrl = () => {
  const expoExtra = Constants.expoConfig?.extra;
  const manifestExtra = (Constants as any).manifest?.extra;

  if (expoExtra?.backendUrl) {
    console.log('[Welcome] Using backendUrl from expoConfig.extra');
    return expoExtra.backendUrl;
  }

  if (manifestExtra?.backendUrl) {
    console.log('[Welcome] Using backendUrl from manifest.extra');
    return manifestExtra.backendUrl;
  }

  if (expoExtra?.EXPO_PUBLIC_BACKEND_URL) {
    console.log('[Welcome] Using EXPO_PUBLIC_BACKEND_URL from expoConfig.extra');
    return expoExtra.EXPO_PUBLIC_BACKEND_URL;
  }

  if (manifestExtra?.EXPO_PUBLIC_BACKEND_URL) {
    console.log('[Welcome] Using EXPO_PUBLIC_BACKEND_URL from manifest.extra');
    return manifestExtra.EXPO_PUBLIC_BACKEND_URL;
  }

  const fallback = 'http://192.168.1.25:8001/health';
  console.log('[Welcome] No backend URL found. Falling back to:', fallback);
  return fallback;
};

const API_URL = resolveBackendUrl();
console.log('[Welcome] Using API URL:', API_URL);

// Interface for the walkthrough slides
interface WalkthroughSlide {
  image: any;
  title: string;
  description: string;
}

// Walkthrough content
const walkthroughSlides: WalkthroughSlide[] = [
  {
    image: require('../../assets/images/walk-1.jpg'),
    title: 'AI-Powered Health Assistant',
    description: 'Get instant health insights and personalized care recommendations'
  },
  {
    image: require('../../assets/images/walk-2.jpg'),
    title: 'Smart Patient Journey',
    description: 'Track your health journey with intelligent monitoring and support'
  },
  {
    image: require('../../assets/images/walk-3.jpg'),
    title: 'Multi-Agent Care',
    description: 'Coordinated care through our advanced multi-agent system'
  }
];

// Network test function with improved resilience
// Returns an object with ok flag and details string for debugging on device
const testBackendConnection = async (): Promise<{ ok: boolean; details?: string }> => {
  try {
    console.log('[Network Test] Attempting to connect to:', API_URL);

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'User-Agent': 'MultiageneticHealthcare/1.0',
      },
    });

    console.log('[Network Test] Response:', {
      status: response.status,
      statusText: response.statusText,
      // headers may not be serializable in all runtimes, guard it
      headers: typeof response.headers?.entries === 'function' ? Object.fromEntries(response.headers.entries()) : undefined,
    });

    // Consider HTTP 2xx as an indicator of connectivity. Many backends return 200 with varying body formats.
    if (response.ok) {
      // Try to parse body if present — accept common health indicators.
      try {
        const text = await response.text();
        console.log('[Network Test] Response body:', text);
        
        if (!text) {
          // empty body but 2xx -> accept as healthy
          return { ok: true };
        }

        // attempt JSON parse
        const data = JSON.parse(text);
        
        // Debug logging for response structure
        console.log('[Network Test] Parsed response structure:', JSON.stringify(data, null, 2));

        // Expecting FastAPI health JSON: {"status":"healthy","service":"orchestration_agent"}
        console.log('[Network Test] Checking data.status:', data?.status);
        console.log('[Network Test] Type of status:', typeof data?.status);
        console.log('[Network Test] Exact response match?', data?.status === 'healthy');
        
        if (typeof data?.status === 'string') {
          const ok = data.status.toLowerCase() === 'healthy';
          console.log('[Network Test] Status check result:', { ok, originalStatus: data.status });
          return { ok, details: `status:${data.status}` };
        }

        // Debug all possible health indicators
        console.log('[Network Test] Checking response keys:', Object.keys(data));
        
        // Handle table-format response
        if (Array.isArray(data) && data[0]?.status) {
          const status = data[0].status.toLowerCase();
          console.log('[Network Test] Found array status:', status);
          return { ok: status === 'healthy', details: `array.status:${status}` };
        }
        
        // Handle other formats
        const statusVal = (data?.state || data?.health)?.toString().toLowerCase();
        if (statusVal) {
          console.log('[Network Test] Found alternative status:', statusVal);
          const ok = ['healthy', 'ok', 'up', 'running'].includes(statusVal);
          return { ok, details: `alt.status:${statusVal}` };
        }

        // Special case for httpstat.us which returns 200 with plain text
        if (API_URL.includes('httpstat.us')) {
          const ok = text.includes('200');
          return { ok, details: `body:${text}` };
        }

        // if JSON didn't include a clear status, accept the 2xx as success
        return { ok: true };
      } catch (parseErr) {
        // non-JSON responses (HTML/text) with 2xx should still be considered successful connectivity
        console.warn('[Network Test] Response parse failed but status is OK, accepting connectivity', parseErr);
        return { ok: true, details: `parseErr:${String(parseErr)}` };
      }
    }

    // Non-2xx response
    console.warn('[Network Test] Non-OK HTTP status:', response.status);
    return { ok: false, details: `HTTP status ${response.status}` };
  } catch (error) {
    console.error('[Network Test] Connection failed:', error);
    return { ok: false, details: `Error: ${String(error)}` };
  }
};

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { width } = Dimensions.get('window');

  const handleNetworkTest = async () => {
    Alert.alert('Testing Connection', 'Checking network connectivity...');
    console.log('[Welcome] Starting connection test');

    try {
      // Add timeout to the connection test
      const timeoutPromise = new Promise<{ ok: boolean; details?: string }>((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out after 5 seconds')), 5000)
      );

      const result = await Promise.race([testBackendConnection(), timeoutPromise]);

      console.log('[Network Test] Final result:', result);
      
      if (result && result.ok) {
        if (API_URL.includes('httpstat.us')) {
          Alert.alert(
            'Connection Successful',
            'Basic internet connectivity test passed.\n\nNetwork appears to be properly configured.'
          );
        } else {
          Alert.alert(
            'Connection Successful',
            'Successfully connected to the backend service.'
          );
        }
      } else {
        // Show details in the alert so we can debug on-device without adb
        const details = result?.details || 'No details available';
        console.log('[Network Test] Warning details:', details);
        Alert.alert(
          'Connection Warning',
          `The server responded but did not indicate a healthy status.\n\nDetails: ${details}`
        );
      }
    } catch (err) {
      const error = err as Error;
      console.error('[Welcome] Connection test failed:', error);
      Alert.alert(
        'Connection Failed',
        `Error: ${error.message}\n\nTroubleshooting:\n` +
        '1. Check your internet connection\n' +
        `2. Verify the backend URL (${API_URL})\n` +
        '3. Check network settings and permissions'
      );
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slide);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {walkthroughSlides.map((slide, index) => (
            <View key={index} style={[styles.slide, { width }]}>
              <View style={styles.imageContainer}>
                <Image
                  source={slide.image}
                  style={styles.walkthroughImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideDescription}>{slide.description}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.pagination}>
          {[0, 1, 2].map((dot) => (
            <View
              key={dot}
              style={[
                styles.paginationDot,
                currentSlide === dot && styles.paginationDotActive
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.loginButton, { marginBottom: 10 }]}
            onPress={handleNetworkTest}
          >
            <Text style={[styles.loginButtonText, { fontSize: 12 }]}>
              Test Backend
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.createAccountButton} 
            onPress={() => router.push('/common/AgentChat')}
          >
            <Text style={styles.createAccountButtonText}>Try Demo</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>.
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
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={{ width: 36, height: 36, tintColor: '#fff' }} 
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}