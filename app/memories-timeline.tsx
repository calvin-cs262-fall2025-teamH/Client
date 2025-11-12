// Client/app/memories-timeline.tsx
import { api } from '@/lib/api';
import { TimelineActivity } from '@/types/api';
import { router } from 'expo-router';
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

export default function MemoriesTimelineScreen() {
  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const response = await api.getTimeline();
      setActivities(response.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load timeline');
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Our Memories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/create-memory')}
        >
          <Text style={styles.addButtonText}>+ Add Memory</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline */}
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
        activities.map((activity, index) => (
          <TouchableOpacity
            key={activity.id}
            style={styles.timelineCard}
            onPress={() => router.push(`/memory-detail?id=${activity.id}`)}
          >
            {/* Date Badge */}
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{formatDate(activity.date)}</Text>
            </View>

            {/* Title & Description */}
            <Text style={styles.activityTitle}>{activity.title}</Text>
            {activity.description && (
              <Text style={styles.activityDescription} numberOfLines={2}>
                {activity.description}
              </Text>
            )}

            {/* Location */}
            {activity.location && (
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>{activity.location}</Text>
              </View>
            )}

            {/* Photo Grid */}
            {activity.photos.length > 0 && (
              <View style={styles.photoGrid}>
                {activity.photos.slice(0, 3).map((photo, photoIndex) => (
                  <View key={photo.id} style={styles.photoWrapper}>
                    <Image
                      source={{ uri: photo.photoUrl }}
                      style={styles.photo}
                      defaultSource={require('@/assets/images/react-logo.png')}
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

            {/* View Details Link */}
            <Text style={styles.viewDetails}>View Full Memory →</Text>
          </TouchableOpacity>
        ))
      )}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'flex-start',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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
  timelineCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
});
