// Client/app/memory-detail.tsx
import { api } from '@/lib/api';
import { ActivityWithPhotos } from '@/types/api';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activity, setActivity] = useState<ActivityWithPhotos | null>(null);
  const [loading, setLoading] = useState(true);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const response = await api.getActivity(parseInt(id!));
      setActivity(response.data || null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load activity');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadActivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
              Alert.alert('Success', 'Memory deleted');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete memory');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading || !activity) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text style={styles.loadingText}>Loading memory...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Date Badge */}
      <View style={styles.dateBadge}>
        <Text style={styles.dateText}>{formatDate(activity.date)}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{activity.title}</Text>

      {/* Location */}
      {activity.location && (
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{activity.location}</Text>
        </View>
      )}

      {/* Description */}
      {activity.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>About this memory</Text>
          <Text style={styles.description}>{activity.description}</Text>
        </View>
      )}

      {/* Photos Collage */}
      <View style={styles.photosSection}>
        <Text style={styles.sectionTitle}>
          Photos ({activity.photos.length})
        </Text>

        {activity.photos.length === 0 ? (
          <View style={styles.noPhotosContainer}>
            <Text style={styles.noPhotosText}>No photos yet</Text>
            <Text style={styles.noPhotosSubtext}>
              Add photos to preserve this memory
            </Text>
          </View>
        ) : (
          <View style={styles.photoGrid}>
            {activity.photos.map((photo) => (
              <View key={photo.id} style={styles.photoCard}>
                <Image
                  source={{ uri: photo.photoUrl }}
                  style={styles.photo}
                  defaultSource={require('@/assets/images/react-logo.png')}
                  resizeMode="cover"
                />
                {photo.caption && (
                  <View style={styles.captionOverlay}>
                    <Text style={styles.captionText}>{photo.caption}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Add Photo Button */}
        <TouchableOpacity
          style={styles.addPhotoButton}
          onPress={() => Alert.alert('Add Photo', 'Photo upload coming soon!')}
        >
          <Text style={styles.addPhotoButtonText}>+ Add Photo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#FF4444',
  },
  dateBadge: {
    backgroundColor: '#FFE5EE',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
  },
  descriptionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  photosSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  noPhotosContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
  },
  noPhotosText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noPhotosSubtext: {
    fontSize: 14,
    color: '#999',
  },
  photoGrid: {
    gap: 12,
    marginBottom: 16,
  },
  photoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#F0F0F0',
  },
  captionOverlay: {
    padding: 12,
    backgroundColor: '#FFF',
  },
  captionText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  addPhotoButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addPhotoButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
