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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
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
  const [photoHeights, setPhotoHeights] = useState<{ [key: number]: number }>({});

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const likeScale = useSharedValue(1);

  const loadActivity = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.getActivity(parseInt(id));
      if (response.data) {
        setActivity(response.data);
        setEditTitle(response.data.title);
        setEditDescription(response.data.description || '');
        setEditDate(response.data.date.split('T')[0]);
        setEditLocation(response.data.location || '');
      }
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load activity');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleDeletePhoto = async (photoIndex: number) => {
    if (!activity || !activity.photos[photoIndex]) return;

    const photo = activity.photos[photoIndex];

    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Don't set full screen loading, maybe just show a toast or something?
              // But for now, let's just do it.
              await api.deletePhoto(activity.id, photo.id);

              // Update local state
              const updatedPhotos = [...activity.photos];
              updatedPhotos.splice(photoIndex, 1);
              setActivity({ ...activity, photos: updatedPhotos });

              // If we deleted the last photo, close the viewer
              if (updatedPhotos.length === 0) {
                setIsImageViewVisible(false);
              } else if (photoIndex >= updatedPhotos.length) {
                // If we deleted the last item, move index back
                setCurrentImageIndex(updatedPhotos.length - 1);
              }

              // Alert.alert('Success', 'Photo deleted'); // Optional, maybe too intrusive
            } catch {
              Alert.alert('Error', 'Failed to delete photo');
            }
          },
        },
      ]
    );
  };

  const handleUpdate = async () => {
    if (!activity) return;
    if (!editTitle.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    try {
      setSaving(true);
      const response = await api.updateActivity(activity.id, {
        title: editTitle,
        description: editDescription,
        date: new Date(editDate).toISOString(),
        location: editLocation,
      });

      if (response.success && response.data) {
        setActivity(prev => prev ? { ...prev, ...response.data! } : null);
        setIsEditing(false);
        Alert.alert('Success', 'Memory updated successfully');
      }
    } catch {
      Alert.alert('Error', 'Failed to update memory');
    } finally {
      setSaving(false);
    }
  };

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
        allowsEditing: false,
        quality: 0.8,
        aspect: [4, 3],
        exif: false,
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
    const containerHeight = photoHeights[i] || 200; // Default height until loaded

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.photoContainer, { height: containerHeight }]}
        onPress={() => {
          setCurrentImageIndex(i);
          setIsImageViewVisible(true);
        }}
        onLongPress={() => handleDeletePhoto(i)}
        delayLongPress={500}
      >
        <Image
          source={{ uri: item.photoUrl }}
          style={styles.photo}
          onLoad={(event) => {
            const { width, height } = event.nativeEvent.source;
            if (width && height) {
              // Calculate height based on image aspect ratio and screen width
              const screenWidth = Dimensions.get('window').width;
              const padding = 8; // margin from photoContainer style (4*2)
              const columnWidth = (screenWidth - padding * 3) / 2; // 2 columns with gaps
              const aspectRatio = height / width;
              const calculatedHeight = columnWidth * aspectRatio;
              // Cap between 150 and 500 for reasonable sizes on all devices
              const finalHeight = Math.min(Math.max(calculatedHeight, 150), 500);
              setPhotoHeights(prev => ({ ...prev, [i]: finalHeight }));
            }
          }}
        />
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
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.iconButton}>
            <Ionicons name="pencil-outline" size={24} color={THEME.text} />
          </TouchableOpacity>
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
          <SafeAreaView style={styles.footerContainer}>
            <Text style={styles.footerText}>{imageIndex + 1} / {images.length}</Text>
            <TouchableOpacity
              style={styles.deletePhotoButton}
              onPress={() => handleDeletePhoto(imageIndex)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </SafeAreaView>
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

      {/* Edit Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditing(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Memory</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Title"
              />

              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={editDate}
                onChangeText={setEditDate}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={editLocation}
                onChangeText={setEditLocation}
                placeholder="Location"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Description"
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdate}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    backgroundColor: '#F0F0F0',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  footerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deletePhotoButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalForm: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: THEME.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
