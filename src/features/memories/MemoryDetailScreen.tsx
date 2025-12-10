import { api } from '@/lib/api';
import { ActivityWithPhotos, Photo } from '@/types/api';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import MasonryList from '@react-native-seoul/masonry-list';
import ImageViewing from 'react-native-image-viewing';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

// Theme Colors
const THEME = {
  background: '#FFF9F9',
  primary: '#E89898',
  secondary: '#D4AF37',
  text: '#4A4A4A',
  card: '#FFFFFF',
};

export function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activity, setActivity] = useState<ActivityWithPhotos | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  const likeScale = useSharedValue(1);

  const loadActivity = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.getActivity(parseInt(id));
      setActivity(response.data || null);
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load activity');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const handleLike = () => {
    setLiked(!liked);
    likeScale.value = withSequence(
      withSpring(1.5),
      withSpring(1)
    );
  };

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library permissions to upload photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error: unknown) {
      console.error('Pick image error:', error);
      Alert.alert('Error', `Failed to pick image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error: unknown) {
      console.error('Take photo error:', error);
      Alert.alert('Error', `Failed to take photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadImage = async (uri: string) => {
    if (!id) return;
    try {
      setUploading(true);
      console.log('Starting upload for:', uri);

      // Firebase Storage REST API configuration
      const FIREBASE_STORAGE_BUCKET = 'couple-bond-8c4d0.firebasestorage.app';
      const filename = `memories/${id}/${Date.now()}.jpg`;
      const encodedFilename = encodeURIComponent(filename);

      // Upload using Expo FileSystem (bypasses all Blob issues)
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/${encodedFilename}`;

      try {
        const uploadResult = await FileSystem.uploadAsync(uploadUrl, uri, {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: {
            'Content-Type': 'image/jpeg',
          },
        });

        if (uploadResult.status !== 200) {
          throw new Error(`Upload failed with status ${uploadResult.status}`);
        }

        console.log('Upload successful:', uploadResult.body);
      } catch (e: unknown) {
        console.error('Firebase raw error:', e);
        throw new Error(`Firebase Upload Failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }

      // Get the download URL
      const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/${encodedFilename}?alt=media`;

      // 3. Save to Backend
      try {
        await api.addPhoto(parseInt(id), {
          photoUrl: downloadURL,
        });
      } catch (e: unknown) {
        throw new Error(`Backend Save Failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }

      loadActivity();
      Alert.alert('Success', 'Photo added successfully!');
    } catch (error: unknown) {
      console.error('Upload error:', error);
      Alert.alert('Upload Error', error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Memory',
      'Are you sure you want to delete this memory? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteActivity(parseInt(id!));
              router.back();
            } catch (error: unknown) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete memory');
            }
          },
        },
      ]
    );
  };

  const renderPhotoItem = ({ item, i }: { item: Photo; i: number }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.photoContainer, { height: i % 2 === 0 ? 200 : 280 }]}
        onPress={() => {
          setCurrentImageIndex(i);
          setIsImageViewVisible(true);
        }}
      >
        <Image source={{ uri: item.photoUrl }} style={styles.photo} />
      </TouchableOpacity>
    );
  };

  if (loading || !activity) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  const images = activity.photos.map(p => ({ uri: p.photoUrl }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleLike} style={styles.iconButton}>
            <Animated.View style={likeAnimatedStyle}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={24}
                color={liked ? "#FF4B4B" : THEME.text}
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={24} color={THEME.text} />
          </TouchableOpacity>
        </View>
      </View>

      <MasonryList
        data={activity.photos}
        keyExtractor={(item: Photo): string => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        renderItem={renderPhotoItem}
        ListHeaderComponent={
          <View style={styles.contentHeader}>
            <Text style={styles.dateText}>
              {new Date(activity.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            <Text style={styles.title}>{activity.title}</Text>
            {activity.description && (
              <Text style={styles.description}>{activity.description}</Text>
            )}
            {activity.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-sharp" size={16} color={THEME.primary} />
                <Text style={styles.locationText}>{activity.location}</Text>
              </View>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <ImageViewing
        images={images}
        imageIndex={currentImageIndex}
        visible={isImageViewVisible}
        onRequestClose={() => setIsImageViewVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        FooterComponent={({ imageIndex }: { imageIndex: number }) => (
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>{imageIndex + 1} / {images.length}</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={showImageOptions}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Ionicons name="camera" size={28} color="#FFF" />
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  contentHeader: {
    padding: 20,
    paddingBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 12,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: THEME.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  photoContainer: {
    margin: 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  footerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  footerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
