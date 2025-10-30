import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './WelcomeScreen.styles';
import { useRouter } from 'expo-router';

export default function WelcomeScreen(/*{ navigation }: any*/) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { width } = Dimensions.get('window');
  const scrollViewRef = useRef<ScrollView>(null);
  const totalSlides = 3;

  const scrollToNextSlide = () => {
    if (scrollViewRef.current) {
      const nextSlide = (currentSlide + 1) % totalSlides;
      scrollViewRef.current.scrollTo({ x: nextSlide * width, animated: true });
      setCurrentSlide(nextSlide);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      scrollToNextSlide();
    }, 3000); // Change slide every 3 seconds

    return () => {
      clearInterval(timer);
    };
  }, [currentSlide, width]);
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
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
              const slide = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentSlide(slide);
            }}
            scrollEventThrottle={16}
          >
            {[
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
            ].map((slide, index) => (
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
            {[0, 1, 2].map((dot, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentSlide === index && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')} >
            <Text style={styles.loginButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.createAccountButton} onPress={() => router.push('/common/AgentChat')} >
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