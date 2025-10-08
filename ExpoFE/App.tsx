import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as React from 'react';
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

import Login from "./app/auth/login.tsx";
import Signup from "./app/auth/patientAuth/signup.tsx";
import Home from "./app/patientProfile/patientHome.tsx";

// Define the navigation stack parameter list
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  PatientHome: undefined;
};

// Create typed stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

// Export navigation prop type for use in other components
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const App: React.FC = () => {
  const [initializing, setInitializing] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Handle user state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return unsubscribe; // unsubscribe on unmount
  }, [initializing]);

  // Show loading screen while initializing
  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
          </>
        ) : (
          <Stack.Screen name="Home" component={Home} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
