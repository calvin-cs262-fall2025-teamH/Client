import { api } from '@/lib/api';
import { TimelineActivity } from '@/types/api';
import { router, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';

const memoryEmojis = [
  '❤️', '💔', '😊', '😢', '🎉', '💑', '🌹', '💖', '😭', '🥰',
  '😡', '😤', '😠', '🤬', '😞', '😔', '😩', '😫', '🥺', '😖', '💢', '👿'
];

export function CollageScreen() {
  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [emptyEmoji, setEmptyEmoji] = useState('💕');

  useFocusEffect(
    useCallback(() => {
      loadTimeline();
    }, [])
  );

  useEffect(() => {
    setEmptyEmoji(memoryEmojis[Math.floor(Math.random() * memoryEmojis.length)]);
  }, []);

  const loadTimeline = async () => {
    try {
      console.log('[Collage] Loading timeline...');
      setLoading(true);
      const response = await api.getTimeline();
      console.log('[Collage] Timeline response:', response);
      setActivities(response.data || []);
    } catch (error: any) {
      console.error('[Collage] Timeline error:', error);
      Alert.alert('Error', error.message || 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTimeline();
    setRefreshing(false);
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
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B2332" />
        <Text style={styles.loadingText}>Loading memories...</Text>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => {
            Alert.alert(
              'Debug Info',
              'Check the console logs to see what\'s happening.\n\nIf stuck here, you likely need to pair with a partner first.',
              [
                { text: 'OK' },
                { text: 'Go to Connect Partner', onPress: () => router.push('/connect-partner') }
              ]
            );
          }}
        >
          <Text style={styles.debugButtonText}>Taking too long? Tap here</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B2332" />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Our Memories</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/create-memory')}
          >
            <Text style={styles.addButtonText}>+ Add Memory</Text>
          </TouchableOpacity>
        </View>

        {activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{emptyEmoji}</Text>
            <Text style={styles.emptyText}>No memories yet</Text>
            <Text style={styles.emptySubtext}>
              Every relationship has ups and downs - capture them all! 💕😢🎉
            </Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => router.push('/create-memory')}
            >
              <Text style={styles.createFirstButtonText}>Create First Memory</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.timelineCard}
              onPress={() => router.push(`/memory-detail?id=${activity.id}`)}
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

              <Text style={styles.viewDetails}>View Full Memory →</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8e5e8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8e5e8',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8e5e8',
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
    color: '#8B2332',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#8B2332',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'flex-start',
    shadowColor: '#8B2332',
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
    backgroundColor: '#8B2332',
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
    borderLeftWidth: 4,
    borderLeftColor: '#8B2332',
  },
  dateBadge: {
    backgroundColor: '#f8e5e8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B2332',
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
    color: '#8B2332',
    fontWeight: '600',
    textAlign: 'right',
  },
  debugButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f8e5e8',
    borderRadius: 8,
  },
  debugButtonText: {
    fontSize: 12,
    color: '#8B2332',
    fontWeight: '600',
  },
});
