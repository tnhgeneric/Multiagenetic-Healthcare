# Phase 1 Merge Execution Guide: Navigation Components

**Status:** Ready for implementation  
**Target:** Complete high-risk navigation merges (BottomNavigation + sideNavigation) + add missing `determineRoles()` method  
**Expected Duration:** 1-2 hours including testing  
**Success Criteria:** Expo starts, navigation works, no TypeScript errors  

---

## Step 1: Add `determineRoles()` Method to AuthService
**File:** `ExpoFE/services/authService.tsx`  
**Why First:** Required by both BottomNavigation and sideNavigation  

### Implementation
Add this method to the `AuthService` class (before `export default new AuthService();`):

```typescript
  // Determine user roles by checking Firestore collections
  // Returns { isDoctor: true } if user in Doctor collection
  // Returns { isDoctor: false } if user in Patient collection only
  // Returns { isDoctor: false, isPatient: false } if user not found
  async determineRoles(uid: string): Promise<{ isDoctor: boolean; isPatient?: boolean }> {
    try {
      if (!uid) {
        console.warn('determineRoles: No UID provided');
        return { isDoctor: false, isPatient: false };
      }

      // Check Doctor collection first
      const doctorDoc = await db.collection('Doctor').doc(uid).get();
      if (doctorDoc.exists) {
        console.log(`determineRoles: User ${uid} is a Doctor`);
        return { isDoctor: true, isPatient: false };
      }

      // Check Patient collection
      const patientDoc = await db.collection('Patient').doc(uid).get();
      if (patientDoc.exists) {
        console.log(`determineRoles: User ${uid} is a Patient`);
        return { isDoctor: false, isPatient: true };
      }

      // User not found in either collection
      console.warn(`determineRoles: User ${uid} not found in Doctor or Patient collections`);
      return { isDoctor: false, isPatient: false };
    } catch (error: any) {
      console.error('determineRoles: Error determining user roles:', error);
      return { isDoctor: false, isPatient: false };
    }
  }
```

### Verify
- Save file
- Check TypeScript compilation: No errors mentioning `determineRoles`

---

## Step 2: Merge BottomNavigation.tsx
**File:** `ExpoFE/app/common/BottomNavigation.tsx`  
**Source:** Integrate features from `frontend/app/common/BottomNavigation.tsx`  
**Changes:** Add role detection + doctor routes + event listener  

### Strategy
- **Keep:** ExpoFE's expo-router navigation approach (simpler, already working)
- **Add from frontend:** Role checks, doctor routes, event listener
- **Updated tabs:** Home, Notification, Chat, More (same as frontend)

### Implementation

Replace the entire file with this merged version:

```tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../../config/firebaseConfig';
import AuthService from '../../services/authService';
import SideNavigationDrawer from './sideNavigation';

interface BottomNavigationProps {
  activeTab: 'home' | 'notification' | 'chat' | 'more' | 'none';
  onTabPress?: (tabName: string) => void;
}

export default function BottomNavigation({
  activeTab,
  onTabPress = () => { }
}: BottomNavigationProps) {
  const router = useRouter();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isDoctor, setIsDoctor] = useState<boolean>(false);

  // Only highlight tab if on these pages
  const highlightTabs = ['home', 'notification', 'chat', 'more'];
  const shouldHighlight = highlightTabs.includes(activeTab);

  const handleTabPress = (tabName: string) => {
    onTabPress(tabName);
    switch (tabName) {
      case 'home':
        if (isDoctor) {
          router.push('/doctorProfile/doctorHome');
        } else {
          router.push('../../../patientProfile/patientHome');
        }
        break;

      case 'notification':
        if (isDoctor) {
          router.push('/doctorProfile/docnotification');
        } else {
          router.push('../../../patientProfile/notification');
        }
        break;

      case 'chat':
        if (isDoctor) {
          router.push('/doctorProfile/docChatbot');
        } else {
          router.push('../../../patientProfile/chat');
        }
        break;

      case 'more':
        setIsDrawerVisible(true);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = auth.currentUser;
        if (!user || !user.uid) {
          setIsDoctor(false);
          return;
        }
        const roles = await AuthService.determineRoles(user.uid);
        setIsDoctor(!!(roles && roles.isDoctor));
      } catch (err) {
        console.warn('Failed to determine roles for bottom nav:', err);
        setIsDoctor(false);
      }
    };

    checkRole();

    // Listen for user changes and re-check role
    if (global.EventEmitter) {
      const handler = () => checkRole();
      global.EventEmitter.on('USER_CHANGED', handler);
      return () => global.EventEmitter.off('USER_CHANGED', handler);
    }
  }, []);

  return (
    <>
      <SideNavigationDrawer
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />

      <View style={styles.container}>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabPress('home')}
        >
          <Feather
            name="home"
            size={22}
            color={shouldHighlight && activeTab === 'home' ? '#7d4c9e' : '#666'}
          />
          <Text style={[
            styles.tabLabel,
            shouldHighlight && activeTab === 'home' && styles.activeTabLabel
          ]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabPress('notification')}
        >
          <Feather
            name="bell"
            size={22}
            color={shouldHighlight && activeTab === 'notification' ? '#7d4c9e' : '#666'}
          />
          <Text style={[
            styles.tabLabel,
            shouldHighlight && activeTab === 'notification' && styles.activeTabLabel
          ]}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabPress('chat')}
        >
          <Feather
            name="message-circle"
            size={22}
            color={shouldHighlight && activeTab === 'chat' ? '#7d4c9e' : '#666'}
          />
          <Text style={[
            styles.tabLabel,
            shouldHighlight && activeTab === 'chat' && styles.activeTabLabel
          ]}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabPress('more')}
        >
          <Feather
            name="menu"
            size={22}
            color={shouldHighlight && activeTab === 'more' ? '#7d4c9e' : '#666'}
          />
          <Text style={[
            styles.tabLabel,
            shouldHighlight && activeTab === 'more' && styles.activeTabLabel
          ]}>More</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabIconContainer: {
    backgroundColor: '#7d4c9e',
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#7d4c9e',
    fontWeight: '500',
  },
});
```

### Key Changes
- ✅ Added `isDoctor` state
- ✅ Added `checkRole()` using `AuthService.determineRoles()`
- ✅ Added USER_CHANGED event listener
- ✅ Updated tab names: 'chat' (not 'ChatMyProfile')
- ✅ Added doctor-specific routing for each tab
- ✅ Updated type to use lowercase 'chat'

### Verify
- Save file
- No TypeScript errors
- Check syntax

---

## Step 3: Merge sideNavigation.tsx
**File:** `ExpoFE/app/common/sideNavigation.tsx`  
**Source:** Integrate features from `frontend/app/common/sideNavigation.tsx`  
**Changes:** Add role detection + doctor menu items + event listener  

### Strategy
- **Keep:** ExpoFE's basic structure and rendering
- **Add from frontend:**
  1. Role detection (isDoctor check)
  2. Separate doctor menu
  3. EVENT listener pattern
  4. Role-based navigation items
- **Merge menus:**
  - Patient: Home, Find Doctor ✨, Uploads, Wellness Hub ✨, Profile ✨, Logout
  - Doctor: Home, Profile, Logout

### Implementation

Replace the entire file with this merged version:

```tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  Image
} from 'react-native';
import {
  Feather,
  FontAwesome5,
  MaterialIcons,
  AntDesign,
  Ionicons
} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import styles from './sideNavigation.styles';
import AuthService from '../../services/authService';

interface SideNavigationProps {
  isVisible: boolean;
  onClose: () => void;
}

interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  iconLibrary: 'Feather' | 'FontAwesome5' | 'MaterialIcons' | 'AntDesign' | 'Ionicons';
  route?: string;
  action?: () => void;
  isLogout?: boolean;
}

export default function SideNavigation({
  isVisible,
  onClose
}: SideNavigationProps) {
  const router = useRouter();
  const [isDoctor, setIsDoctor] = useState<boolean>(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);

      // Trigger global event if available
      if (global.EventEmitter) {
        console.log("SideNav: Emitting USER_CHANGED event for sign out");
        global.EventEmitter.emit('USER_CHANGED');
      }

      onClose();
      router.replace('../common/welcomeScreen');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Sign Out Error', 'Failed to sign out. Please try again.');
    }
  };

  const patientNavigationItems: NavigationItem[] = [
    {
      id: '1',
      title: 'Home',
      icon: 'home',
      iconLibrary: 'Feather',
      route: '../../../patientProfile/patientHome'
    },
    {
      id: '2',
      title: 'Find a Doctor',
      icon: 'search',
      iconLibrary: 'Feather',
      route: '../../../patientProfile/more/doctorSearch/doctorSearch'
    },
    {
      id: '3',
      title: 'Uploads',
      icon: 'upload',
      iconLibrary: 'Feather',
      route: '../../../patientProfile/more/patientProfilee/uploads'
    },
    {
      id: '4',
      title: 'Wellness Hub',
      icon: 'heart',
      iconLibrary: 'AntDesign',
      route: '../../../patientProfile/more/patientProfilee/healthtips'
    },
    {
      id: '5',
      title: 'Profile',
      icon: 'user',
      iconLibrary: 'Feather',
      route: '../../../patientProfile/more/patientProfilee/profilePage'
    },
    {
      id: '6',
      title: 'Logout',
      icon: 'log-out',
      iconLibrary: 'Feather',
      action: handleSignOut,
      isLogout: true
    }
  ];

  // Doctor-specific reduced menu
  const doctorNavigationItems: NavigationItem[] = [
    {
      id: '1',
      title: 'Home',
      icon: 'home',
      iconLibrary: 'Feather',
      route: '/doctorProfile/doctorHome'
    },
    {
      id: '2',
      title: 'Profile',
      icon: 'user',
      iconLibrary: 'Feather',
      route: '/auth/Auth/createDocProfile'
    },
    {
      id: '3',
      title: 'Logout',
      icon: 'log-out',
      iconLibrary: 'Feather',
      action: handleSignOut,
      isLogout: true
    }
  ];

  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = auth.currentUser;
        if (!user || !user.uid) {
          setIsDoctor(false);
          return;
        }
        const roles = await AuthService.determineRoles(user.uid);
        if (roles && roles.isDoctor) {
          setIsDoctor(true);
        } else {
          setIsDoctor(false);
        }
      } catch (err) {
        console.warn('Failed to determine roles for side nav:', err);
        setIsDoctor(false);
      }
    };

    checkRole();

    // Listen for user changes and re-check role
    if (global.EventEmitter) {
      const handler = () => checkRole();
      global.EventEmitter.on('USER_CHANGED', handler);
      return () => global.EventEmitter.off('USER_CHANGED', handler);
    }
  }, []);

  const navigationItems = isDoctor ? doctorNavigationItems : patientNavigationItems;

  const handleItemPress = (item: NavigationItem) => {
    if (item.action) {
      item.action();
    } else if (item.route) {
      onClose();
      router.push(item.route as any);
    }
  };

  const renderIcon = (item: NavigationItem) => {
    const iconProps = {
      size: 20,
      color: item.isLogout ? '#7d4c9e' : '#666'
    };

    switch (item.iconLibrary) {
      case 'Feather':
        return <Feather name={item.icon as React.ComponentProps<typeof Feather>['name']} {...iconProps} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={item.icon as React.ComponentProps<typeof FontAwesome5>['name']} {...iconProps} />;
      case 'MaterialIcons':
        return <MaterialIcons name={item.icon as React.ComponentProps<typeof MaterialIcons>['name']} {...iconProps} />;
      case 'AntDesign':
        return <AntDesign name={item.icon as React.ComponentProps<typeof AntDesign>['name']} {...iconProps} />;
      case 'Ionicons':
        return <Ionicons name={item.icon as React.ComponentProps<typeof Ionicons>['name']} {...iconProps} />;
      default:
        return <Feather name={item.icon as React.ComponentProps<typeof Feather>['name']} {...iconProps} />;
    }
  };

  const renderNavigationItem = (item: NavigationItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.navigationItem,
        item.isLogout && styles.logoutItem
      ]}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemContent}>
        <View style={[
          styles.iconContainer,
          item.isLogout && styles.logoutIconContainer
        ]}>
          {renderIcon(item)}
        </View>
        <Text style={[
          styles.itemText,
          item.isLogout && styles.logoutText
        ]}>
          {item.title}
        </Text>
      </View>
      <Feather
        name="chevron-right"
        size={16}
        color={item.isLogout ? '#7d4c9e' : '#ccc'}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayBackground}
          onPress={onClose}
          activeOpacity={1}
        />

        <View style={styles.drawerContainer}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {isDoctor ? 'Doctor Portal' : 'Menu'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.itemsList}>
              {navigationItems.map(renderNavigationItem)}
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
```

### Key Changes
- ✅ Added `isDoctor` state
- ✅ Added `checkRole()` using `AuthService.determineRoles()`
- ✅ Added USER_CHANGED event listener
- ✅ Separate patient and doctor navigation items
- ✅ Role-based conditional rendering of menu items
- ✅ Patient menu includes: Find Doctor, Wellness Hub, Profile (new items)
- ✅ Doctor menu is simplified (Home, Profile, Logout)
- ✅ Header changes based on role

### Verify
- Save file
- No TypeScript errors
- Check syntax

---

## Step 4: Test Phase 1
**Duration:** 10-15 minutes  
**Goal:** Verify navigation components work  

### Test Procedure

1. **Start Expo**
   ```powershell
   cd ExpoFE
   npx expo start -c
   ```
   - Wait for Metro bundler to complete
   - Expected: "Expo server running" message

2. **Check for TypeScript errors**
   - Watch the terminal output for any TypeScript errors
   - Expected: No TS errors related to BottomNavigation, sideNavigation, or AuthService

3. **Start emulator or scan QR code**
   - If emulator available: Press `a` (Android) or `i` (iOS)
   - If using physical device: Scan QR code with Expo Go app

4. **Manual Navigation Tests**
   - ✅ Bottom navigation renders without errors
   - ✅ Each tab icon/label displays
   - ✅ Tapping "More" opens side menu
   - ✅ Side menu closes when X tapped
   - ✅ Menu items render (varies by user role if doctor/patient accounts exist)
   - ✅ Navigation items navigate to correct screens (if routes exist)
   - ✅ Logout works and triggers USER_CHANGED event

### Troubleshooting

**Issue:** TypeScript error "Property 'determineRoles' does not exist"
- **Fix:** Verify the method was added to authService.tsx before the `export default new AuthService();` line

**Issue:** Module not found error for BottomNavigation imports
- **Fix:** Check all import paths are correct and files exist

**Issue:** "Cannot find module 'sideNavigation'"
- **Fix:** Verify file exists at ExpoFE/app/common/sideNavigation.tsx

**Issue:** Navigation not working (routes not found)
- **Fix:** Routes may not exist yet on disk. This is expected for doctor profile routes. Focus on testing that navigation calls are made without crashes.

---

## Phase 1 Checklist

- [ ] Added `determineRoles()` method to ExpoFE/services/authService.tsx
- [ ] Updated ExpoFE/app/common/BottomNavigation.tsx with role detection + doctor routes
- [ ] Updated ExpoFE/app/common/sideNavigation.tsx with role-based menus
- [ ] No TypeScript errors in modified files
- [ ] Expo starts successfully (`npx expo start -c`)
- [ ] BottomNavigation renders and taps work
- [ ] sideNavigation opens/closes properly
- [ ] No runtime crashes when testing navigation
- [ ] USER_CHANGED events don't cause errors

---

## Next Steps After Phase 1

Once Phase 1 completes successfully:
1. Commit changes to git
2. Create git branch for Phase 2 if not done already
3. Proceed with Phase 2: Copy updateProfile.tsx, merge notification.tsx
4. Continue with Phase 3-4 for remaining features

---

**Document Created:** 2025-01-25  
**Merge Target:** ExpoFE v1.3 (with frontend features)  
**Dependencies:** Firebase Auth, Expo Router, React Native  

