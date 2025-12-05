import React from 'react';
import { View, ImageBackground, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemedBackground({ children, style, ...props }: ViewProps) {
  const { backgroundColor, backgroundImage } = useTheme();

  if (backgroundImage) {
    return (
      <ImageBackground 
        source={{ uri: backgroundImage }} 
        style={[styles.container, style]}
        resizeMode="cover"
        {...props}
      >
        {children}
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
