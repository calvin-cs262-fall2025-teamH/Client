import { api } from '@/lib/api';
import { TimelineActivity } from '@/types/api';
import { router, useFocusEffect } from 'expo-router';
import { useMemo, useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
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

export function MemoriesTimelineScreen() {
  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingActivityId, setUploadingActivityId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadTimeline();
    }, [])
  );

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const response = await api.getTimeline();
      setActivities(response.data || []);
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const timelineEntries = useMemo(() => {
    const entries: ({ type: 'year'; year: number } | { type: 'activity'; activity: TimelineActivity })[] = [];
    let previousYear: number | null = null;

    activities.forEach(activity => {
      const year = new Date(activity.date).getFullYear();
      if (year !== previousYear) {
        entries.push({ type: 'year', year });
        previousYear = year;
      }
      entries.push({ type: 'activity', activity });
    });

    return entries;
  }, [activities]);

  const handleAddPhotos = async (activityId: number) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Please allow photo library access to upload images.');
        return;
      }

      const picker = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });

      if (picker.canceled || !picker.assets?.length) {
        return;
      }

      const asset = picker.assets[0];
      if (!asset.base64) {
        Alert.alert('Error', 'Unable to read the selected image. Please try another photo.');
        return;
      }

      setUploadingActivityId(activityId);
      const dataUrl = `data:image/jpeg;base64,${asset.base64}`;
      await api.addPhoto(activityId, { photoUrl: dataUrl });
      await loadTimeline();
      Alert.alert('Success', 'Photo added to this memory.');
    } catch (error: unknown) {
      console.error('[timeline] add photo error', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload photo.');
    } finally {
      setUploadingActivityId(null);
    }
  };

  const renderAddButtons = () => (
    <View style={styles.actionRow}>
      <TouchableOpacity style={styles.primaryActionButton} onPress={() => router.push('/create-memory?type=experience')}>
        <Text style={styles.primaryActionText}>Add Experience</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.primaryActionButton} onPress={() => router.push('/create-memory?type=education')}>
        <Text style={styles.primaryActionText}>Add Education</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTimelineEntries = () => {
    let activityCounter = -1;
    return timelineEntries.map((entry) => {
      if (entry.type === 'year') {
        return (
          <View key={`year-${entry.year}`} style={styles.yearMarker}>
            <Text style={styles.yearMarkerText}>{entry.year}</Text>
          </View>
        );
      }

      activityCounter += 1;
      const isLeft = activityCounter % 2 === 0;
      const activity = entry.activity;

      return (
        <View
          key={activity.id}
          style={[styles.timelineItem, isLeft ? styles.itemLeft : styles.itemRight]}
        >
          <TouchableOpacity
            style={styles.timelineCard}
            onPress={() => router.push(`/memory-detail?id=${activity.id}`)}
            activeOpacity={0.9}
          >
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{formatDate(activity.date)}</Text>
            </View>

            <Text style={styles.activityTitle}>{activity.title}</Text>
            {activity.description && (
              <Text style={styles.activityDescription} numberOfLines={2}>
                {activity.description}
              </Text>
            )}

            {activity.location && (
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>{activity.location}</Text>
              </View>
            )}

            {activity.photos.length > 0 && (
              <View style={styles.photoGrid}>
                {activity.photos.slice(0, 3).map((photo) => (
                  <View key={photo.id} style={styles.photoWrapper}>
                    <Image
                      source={{ uri: photo.photoUrl }}
                      style={styles.photo}
                    />
                  </View>
                ))}
                {activity.photos.length > 3 && (
                  <View style={styles.morePhotosOverlay}>
                    <Text style={styles.morePhotosText}>
                      +{activity.photos.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => handleAddPhotos(activity.id)}
                disabled={uploadingActivityId === activity.id}
              >
                <Text style={styles.secondaryActionText}>
                  {uploadingActivityId === activity.id ? 'Uploading…' : 'Add Photos'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.viewDetails}>View Details →</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text style={styles.loadingText}>Loading memories...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Work & Education Timeline</Text>
        <Text style={styles.subtitle}>Document milestones, attach photos, and celebrate progress together.</Text>
      </View>

      {renderAddButtons()}

      {activities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📸</Text>
          <Text style={styles.emptyText}>No memories yet</Text>
          <Text style={styles.emptySubtext}>
            Start creating beautiful memories together!
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => router.push('/create-memory')}
          >
            <Text style={styles.createFirstButtonText}>Create First Memory</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.timelineWrapper}>
          <View style={styles.timelineLine} />
          {renderTimelineEntries()}
        </View>
      )}

      <View style={styles.footerNav}>
        <TouchableOpacity style={styles.footerButton} onPress={() => router.back()}>
          <Text style={styles.footerButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.paginationDots}>
          {[1, 2, 3, 4].map(step => (
            <View key={step} style={[styles.paginationDot, step === 3 && styles.paginationDotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.footerButton} onPress={() => router.push('/calendar-screen')}>
          <Text style={styles.footerButtonText}>Next ›</Text>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    marginTop: 6,
    color: '#666',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  primaryActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#312E81',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  createFirstButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
  },
  createFirstButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  timelineWrapper: {
    position: 'relative',
    paddingVertical: 10,
    marginBottom: 32,
  },
  timelineLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E5E7EB',
  },
  yearMarker: {
    alignItems: 'center',
    marginBottom: 12,
  },
  yearMarkerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  timelineItem: {
    width: '100%',
    marginBottom: 20,
  },
  itemLeft: {
    alignItems: 'flex-start',
    paddingRight: '15%',
  },
  itemRight: {
    alignItems: 'flex-end',
    paddingLeft: '15%',
  },
  timelineCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dateBadge: {
    backgroundColor: '#FFE5EE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  activityTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#888',
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  photoWrapper: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  morePhotosOverlay: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    width: '30%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewDetails: {
    fontSize: 14,
    color: '#FF6B9D',
    fontWeight: '600',
    textAlign: 'right',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  secondaryActionText: {
    color: '#6D28D9',
    fontWeight: '600',
  },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  footerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    backgroundColor: '#FFF',
  },
  footerButtonText: {
    color: '#4C1D95',
    fontWeight: '600',
  },
  paginationDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },
  paginationDotActive: {
    backgroundColor: '#7C3AED',
  },
});
