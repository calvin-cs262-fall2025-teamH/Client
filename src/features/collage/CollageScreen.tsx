import { api } from '@/lib/api';
import { TimelineActivity } from '@/types/api';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

// Theme Colors
const THEME = {
  background: '#FFF9F9', // Creamy
  primary: '#E89898',    // Soft Pink
  secondary: '#D4AF37',  // Gold
  text: '#4A4A4A',       // Dark Grey
  card: '#FFFFFF',
  shadow: '#E8D5D5',
};

const CollageCard = ({ item, index }: { item: TimelineActivity; index: number }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const renderCollage = () => {
    const photos = item.photos || [];
    if (photos.length === 0) return null;

    if (photos.length === 1) {
      return (
        <Image source={{ uri: photos[0].photoUrl }} style={styles.singlePhoto} />
      );
    }

    if (photos.length === 2) {
      return (
        <View style={styles.row}>
          <Image source={{ uri: photos[0].photoUrl }} style={styles.halfPhoto} />
          <Image source={{ uri: photos[1].photoUrl }} style={styles.halfPhoto} />
        </View>
      );
    }

    if (photos.length >= 3) {
      return (
        <View style={styles.collageContainer}>
          <Image source={{ uri: photos[0].photoUrl }} style={styles.mainPhoto} />
          <View style={styles.sidePhotos}>
            <Image source={{ uri: photos[1].photoUrl }} style={styles.quarterPhoto} />
            <Image source={{ uri: photos[2].photoUrl }} style={styles.quarterPhoto} />
            {photos.length > 3 && (
              <View style={styles.moreOverlay}>
                <Text style={styles.moreText}>+{photos.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      );
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={[styles.cardContainer, animatedStyle]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push(`/memory-detail?id=${item.id}`)}
        style={styles.card}
      >
        <View style={styles.headerRow}>
          <View style={styles.dateContainer}>
            <Text style={styles.dayText}>{new Date(item.date).getDate()}</Text>
            <View style={styles.monthYearContainer}>
              <Text style={styles.monthText}>
                {new Date(item.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
              </Text>
              <Text style={styles.yearText}>{new Date(item.date).getFullYear()}</Text>
            </View>
          </View>
          {item.location && (
            <View style={styles.locationBadge}>
              <Text style={styles.locationText}>📍 {item.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.collageWrapper}>
          {renderCollage()}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{item.title}</Text>
          {item.description && (
            <Text style={styles.description} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export function CollageScreen() {
  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadTimeline();
    }, [])
  );

  const loadTimeline = async () => {
    try {
      const response = await api.getTimeline();
      setActivities(response.data || []);
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load timeline');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTimeline();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Story</Text>
        <Text style={styles.headerSubtitle}>Every moment counts 💗</Text>
      </View>

      <FlatList
        data={activities}
        renderItem={({ item, index }) => <CollageCard item={item} index={index} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📸</Text>
            <Text style={styles.emptyText}>No memories yet</Text>
            <Text style={styles.emptySubtext}>Let&apos;s create our first memory!</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create-memory')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>➕</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    letterSpacing: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    padding: 16,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: THEME.primary,
    marginRight: 8,
  },
  monthYearContainer: {
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
  },
  yearText: {
    fontSize: 12,
    color: '#CCC',
  },
  locationBadge: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '600',
  },
  collageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 250,
    backgroundColor: '#F5F5F5',
  },
  singlePhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  row: {
    flexDirection: 'row',
    height: '100%',
  },
  halfPhoto: {
    flex: 1,
    height: '100%',
    marginRight: 2,
  },
  collageContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  mainPhoto: {
    flex: 2,
    height: '100%',
    marginRight: 2,
  },
  sidePhotos: {
    flex: 1,
    height: '100%',
    justifyContent: 'space-between',
  },
  quarterPhoto: {
    width: '100%',
    height: '49.5%',
  },
  moreOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '100%',
    height: '49.5%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#888',
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
  fabIcon: {
    fontSize: 24,
    color: '#FFF',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#CCC',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#DDD',
    marginTop: 8,
  },
});
