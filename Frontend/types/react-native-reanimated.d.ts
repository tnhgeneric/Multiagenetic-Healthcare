// Temporary shim for react-native-reanimated types
// Replace with proper types by installing 'react-native-reanimated' or a proper @types package
declare module 'react-native-reanimated' {
  import { ComponentType } from 'react';

  const Animated: any;
  export default Animated;

  export const useSharedValue: (...args: any[]) => any;
  export const useAnimatedStyle: (...args: any[]) => any;
  export const withRepeat: (...args: any[]) => any;
  export const withSequence: (...args: any[]) => any;
  export const withTiming: (...args: any[]) => any;
  export const interpolate: (...args: any[]) => any;
  export const useAnimatedRef: (...args: any[]) => any;
  export const useScrollViewOffset: (...args: any[]) => any;
  export const runOnJS: (...args: any[]) => any;
  export const Easing: any;
  export const ScrollView: ComponentType<any>;
}
