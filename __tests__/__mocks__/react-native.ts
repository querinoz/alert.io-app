export const Platform = { OS: 'web', select: (opts: any) => opts.web ?? opts.default };
export const Dimensions = {
  get: () => ({ width: 1024, height: 768 }),
  addEventListener: () => ({ remove: () => {} }),
};
export const StyleSheet = {
  create: (s: any) => s,
  hairlineWidth: 0.5,
};
export const Animated = {
  Value: class { constructor(v: number) {} interpolate() { return this; } },
  View: 'View',
  createAnimatedComponent: (c: any) => c,
  timing: () => ({ start: (cb?: any) => cb?.() }),
  spring: () => ({ start: (cb?: any) => cb?.() }),
  loop: () => ({ start: () => {}, stop: () => {} }),
  sequence: () => ({ start: (cb?: any) => cb?.() }),
  parallel: () => ({ start: (cb?: any) => cb?.() }),
  delay: () => ({ start: (cb?: any) => cb?.() }),
  multiply: () => ({}),
};
export const Easing = { linear: (t: number) => t, ease: (t: number) => t, inOut: () => (t: number) => t, out: () => (t: number) => t, in: () => (t: number) => t, cubic: (t: number) => t };
export const View = 'View';
export const Text = 'Text';
export const Pressable = 'Pressable';
export const ScrollView = 'ScrollView';
export const FlatList = 'FlatList';
export const TextInput = 'TextInput';
export const Image = 'Image';
export const ActivityIndicator = 'ActivityIndicator';
export const Switch = 'Switch';
export const KeyboardAvoidingView = 'KeyboardAvoidingView';
export const Linking = { canOpenURL: async () => true, openURL: async () => {} };
export const StatusBar = 'StatusBar';
