import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  backgroundColor: string;
  backgroundImage: string | null;
  setBackgroundColor: (color: string) => Promise<void>;
  setBackgroundImage: (uri: string | null) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [backgroundColor, setBackgroundColorState] = useState<string>('#FFFFFF');
  const [backgroundImage, setBackgroundImageState] = useState<string | null>(null);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedColor = await AsyncStorage.getItem('theme_backgroundColor');
      const storedImage = await AsyncStorage.getItem('theme_backgroundImage');
      
      if (storedColor) setBackgroundColorState(storedColor);
      if (storedImage) setBackgroundImageState(storedImage);
    } catch (error) {
      console.error('Failed to load theme', error);
    }
  };

  const setBackgroundColor = async (color: string) => {
    try {
      await AsyncStorage.setItem('theme_backgroundColor', color);
      // If setting color, we might want to clear image or keep it? 
      // Usually background image overrides color. 
      // Let's allow both, but UI will decide precedence.
      setBackgroundColorState(color);
    } catch (error) {
      console.error('Failed to save background color', error);
    }
  };

  const setBackgroundImage = async (uri: string | null) => {
    try {
      if (uri) {
        await AsyncStorage.setItem('theme_backgroundImage', uri);
      } else {
        await AsyncStorage.removeItem('theme_backgroundImage');
      }
      setBackgroundImageState(uri);
    } catch (error) {
      console.error('Failed to save background image', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      backgroundColor, 
      backgroundImage, 
      setBackgroundColor, 
      setBackgroundImage 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
