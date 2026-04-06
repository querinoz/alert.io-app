import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

export type ScreenSize = 'phone' | 'tablet' | 'desktop';

export function useResponsive() {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => sub.remove();
  }, []);

  const width = dimensions.width;
  const height = dimensions.height;

  const screenSize: ScreenSize =
    width >= 1024 ? 'desktop' : width >= 600 ? 'tablet' : 'phone';

  const isDesktop = screenSize === 'desktop';
  const isTablet = screenSize === 'tablet';
  const isPhone = screenSize === 'phone';
  const isWeb = Platform.OS === 'web';
  const isWideScreen = width >= 768;
  const showSidebar = isWideScreen;
  const sidebarWidth = Math.min(400, width * 0.35);

  const isLandscape = width > height;
  const safeTop = Platform.OS === 'ios' ? 54 : Platform.OS === 'android' ? 36 : 0;
  const safeBottom = Platform.OS === 'ios' ? 34 : 0;

  const fontScale = isPhone ? 0.9 : isTablet ? 0.95 : 1;
  const spacingScale = isPhone ? 0.85 : isTablet ? 0.92 : 1;

  return {
    width,
    height,
    screenSize,
    isDesktop,
    isTablet,
    isPhone,
    isWeb,
    isWideScreen,
    showSidebar,
    sidebarWidth,
    isLandscape,
    safeTop,
    safeBottom,
    fontScale,
    spacingScale,
  };
}
