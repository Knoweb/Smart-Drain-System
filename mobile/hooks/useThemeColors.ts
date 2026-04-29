import { useColorScheme } from 'react-native';

export function useThemeColors() {
  const isDark = useColorScheme() === 'dark';
  return {
    isDark,
    bg: isDark ? '#1a202c' : '#f0f4f8',
    card: isDark ? '#2d3748' : '#ffffff',
    textMain: isDark ? '#f7fafc' : '#1a202c',
    textSub: isDark ? '#a0aec0' : '#718096',
    border: isDark ? '#4a5568' : '#edf2f7',
    activeBtn: isDark ? '#4a5568' : '#f7fafc',
    iconColor: isDark ? '#a0aec0' : '#4a5568',
  };
}
