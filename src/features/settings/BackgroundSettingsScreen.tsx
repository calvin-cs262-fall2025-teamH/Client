import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import * as ImagePicker from 'expo-image-picker';

const PRESET_COLORS = [
  '#FFFFFF', // White
  '#F0F0F0', // Light Gray
  '#FFF0F5', // Lavender Blush
  '#E6E6FA', // Lavender
  '#F0F8FF', // Alice Blue
  '#E0FFFF', // Light Cyan
  '#F5F5DC', // Beige
  '#FFFACD', // Lemon Chiffon
  '#FFE4E1', // Misty Rose
];

export function BackgroundSettingsScreen() {
  const { backgroundColor, backgroundImage, setBackgroundColor, setBackgroundImage } = useTheme();

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled) {
      await setBackgroundImage(result.assets[0].uri);
    }
  };

  const clearImage = async () => {
    await setBackgroundImage(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Background Color</Text>
        <View style={styles.colorGrid}>
          {PRESET_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                backgroundColor === color && !backgroundImage && styles.selectedOption,
              ]}
              onPress={() => {
                setBackgroundColor(color);
                setBackgroundImage(null); // Clear image when color is selected
              }}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Background Image</Text>
        
        {backgroundImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: backgroundImage }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeButton} onPress={clearImage}>
              <Text style={styles.removeButtonText}>Remove Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.placeholderText}>No image selected</Text>
        )}

        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.uploadButtonText}>Select from Gallery</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedOption: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePreview: {
    width: 200,
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  placeholderText: {
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  removeButton: {
    padding: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
