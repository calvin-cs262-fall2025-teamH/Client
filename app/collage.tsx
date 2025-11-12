import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import type { TimelineActivity } from '@/types/api';
import { usePartner } from '@/contexts/PartnerContext';

export default function Collage() {
  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasPartner } = usePartner();

  useEffect(() => {
    if (hasPartner) {
      loadTimeline();
    } else {
      setLoading(false);
    }
  }, [hasPartner]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const response = await api.getTimeline();
      if (response.success && response.data) {
        setActivities(response.data);
      }
    } catch (error: any) {
      console.error('Load timeline error:', error);
      Alert.alert('Error', error.message || 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMemory = () => {
    if (!hasPartner) {
      Alert.alert('No Partner', 'You need to connect with a partner first');
      router.push('/connect-partner');
      return;
    }
    // TODO: Navigate to create memory screen
    Alert.alert('Coming Soon', 'Create memory feature will be implemented');
  };

  if (!hasPartner) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>📸 Shared Photo Timeline</Text>
        <Text style={styles.emptyText}>Connect with your partner to start creating memories together!</Text>
        <TouchableOpacity style={styles.connectBtn} onPress={() => router.push('/connect-partner')}>
          <Text style={styles.connectBtnText}>Connect Partner</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B2332" />
        <Text style={styles.loadingText}>Loading memories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📸 Our Timeline</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleCreateMemory}>
          <Text style={styles.addBtnText}>+ Add Memory</Text>
        </TouchableOpacity>
      </View>

      {activities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No memories yet. Create your first one!</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={handleCreateMemory}>
            <Text style={styles.uploadText}>+ Create First Memory</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.timeline}>
          {activities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDate}>
                  {new Date(activity.date).toLocaleDateString()}
                </Text>
              </View>

              {activity.description && (
                <Text style={styles.activityDescription}>{activity.description}</Text>
              )}

              {activity.location && (
                <Text style={styles.activityLocation}>📍 {activity.location}</Text>
              )}

              {activity.photos && activity.photos.length > 0 && (
                <View style={styles.photoIndicator}>
                  <Text style={styles.photoCount}>📷 {activity.photos.length} photos</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => {
                  // TODO: Navigate to activity detail
                  Alert.alert('View Details', `Activity ID: ${activity.id}`);
                }}
              >
                <Text style={styles.viewBtnText}>View Details →</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  addBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#8B2332',
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadBtn: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8e5e8',
    borderWidth: 2,
    borderColor: '#8B2332',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B2332',
  },
  connectBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#8B2332',
    borderRadius: 12,
  },
  connectBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeline: {
    flex: 1,
    padding: 16,
  },
  activityCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  activityDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  activityDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  activityLocation: {
    fontSize: 14,
    color: '#8B2332',
    marginBottom: 8,
  },
  photoIndicator: {
    marginTop: 8,
    marginBottom: 8,
  },
  photoCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B2332',
    alignSelf: 'flex-start',
  },
  viewBtnText: {
    color: '#8B2332',
    fontSize: 14,
    fontWeight: '600',
  },
});
