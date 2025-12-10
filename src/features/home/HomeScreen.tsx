import { router, useFocusEffect } from 'expo-router';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '@/contexts/PartnerContext';
import { api } from '@/lib/api';
import { ThemedBackground } from '@/components/ThemedBackground';

export function HomeScreen() {
  const [selectedEmoji, setSelectedEmoji] = useState('😭');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [partnerEmoji, setPartnerEmoji] = useState('😭');
  const [refreshing, setRefreshing] = useState(false);
  const { hasPartner, partner, loading, refreshPartner } = usePartner();

  const loadUserProfile = useCallback(async () => {
    try {
      const response = await api.getProfile();
      if (response.success && response.data) {
        setUserName(response.data.name || null);
        setSelectedEmoji(response.data.emoji || '😭');
        // Also update partner emoji from profile response
        if (response.data.partner?.emoji) {
          setPartnerEmoji(response.data.partner.emoji);
        }
      }
    } catch {
      // Silently handle error
    }
  }, []);

  // Only load once when component mounts
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // 当页面获得焦点时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
      refreshPartner(true);
    }, [loadUserProfile, refreshPartner])
  );

  // 下拉刷新：同步partner的更改
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    await refreshPartner(true);
    setRefreshing(false);
  };

  const emojis = [
    '❤️', '💕', '😊', '🥰', '🎉',
    '💔', '😢', '😭', '😞', '🥺',
    '😡', '😤', '😠', '👿', '😩'
  ];

  const featureCards = useMemo(() => ([
    {
      title: 'Prayer List',
      subtitle: 'Share your prayers together',
      icon: 'heart-outline' as const,
      color: '#FF6B9D',
      gradient: ['#FFE5F0', '#FFD1E3'],
      action: () => router.push('/prayer-list'),
    },
    {
      title: 'Calendar',
      subtitle: 'Plan your time together',
      icon: 'calendar-outline' as const,
      color: '#8B2332',
      gradient: ['#F8E5E8', '#F5C8D2'],
      action: () => router.push('/calendar-screen'),
    },
    {
      title: 'Anniversary',
      subtitle: 'Never miss special days',
      icon: 'gift-outline' as const,
      color: '#D946A6',
      gradient: ['#FAE8F5', '#F3D4EB'],
      action: () => router.push('/anniversary-reminders'),
      disabled: false,
    },
    {
      title: 'Daily Bread',
      subtitle: 'Grow in faith together',
      icon: 'book-outline' as const,
      color: '#C026D3',
      gradient: ['#F5E5FA', '#EBD1F0'],
      action: () => router.push('/devotional'),
    },

  ]), []);

  return (
    <ThemedBackground>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B2332']}
            tintColor="#8B2332"
          />
        }
      >
      <View style={styles.header}>
        <Text style={styles.appName}>CoupleBond</Text>
        <Text style={styles.tagline}>Stay connected with your partner ❤️</Text>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B2332" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B2332']}
            tintColor="#8B2332"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B2332" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {/* Modern profile cards */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.modernProfileCard}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            <View style={styles.profileAvatar}>
              <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
                <Text style={styles.emojiLarge}>{selectedEmoji}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>{userName || 'Your Profile'}</Text>
            <Text style={styles.profileLabel}>You</Text>
          </TouchableOpacity>

          <View style={styles.connectionLine}>
            <View style={styles.heartIcon}>
              <Ionicons name="heart" size={20} color="#FF6B9D" />
            </View>
          </View>

          {hasPartner && partner ? (
            <TouchableOpacity
              style={styles.modernProfileCard}
              onPress={() => router.push('/partner-info')}
              activeOpacity={0.8}
            >
              <View style={styles.profileAvatar}>
                <Text style={styles.emojiLarge}>{partnerEmoji}</Text>
              </View>
              <Text style={styles.profileName}>{partner.name || partner.email}</Text>
              <Text style={styles.profileLabel}>Partner</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.modernConnectCard}
              onPress={() => router.push('/connect-partner')}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add" size={32} color="#8B2332" />
              <Text style={styles.connectLabel}>Connect Partner</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Emoji picker modal */}
        {showEmojiPicker && (
          <View style={styles.emojiPicker}>
            <Text style={styles.emojiPickerTitle}>How are you feeling?</Text>
            <View style={styles.emojiGrid}>
              {emojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiButton}
                  onPress={async () => {
                    setSelectedEmoji(emoji);
                    setShowEmojiPicker(false);
                    try {
                      await api.updateProfile({ emoji });
                    } catch {
                      // Silently handle error
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[
              styles.featureTitle,
              card.disabled && styles.featureTitleDisabled
            ]}>
              {card.title}
            </Text>
            <Text style={[
              styles.featureSubtitle,
              card.disabled && styles.featureSubtitleDisabled
            ]}>
              {card.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  headerPlaceholder: {
    width: 40,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 6,
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 15,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  modernProfileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '40%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8e5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emojiLarge: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 4,
    textAlign: 'center',
  },
  profileLabel: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  connectionLine: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modernConnectCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#8B2332',
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
    height: 160,
  },
  connectLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B2332',
    marginTop: 8,
    textAlign: 'center',
  },
  emojiPicker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emojiPickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  emojiText: {
    fontSize: 28,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  featureCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  featureCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  featureCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonBadge: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  featureCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
  },
  featureCardTitleDisabled: {
    color: '#999',
  },
  featureCardSubtitle: {
    fontSize: 13,
    color: '#7f8c8d',
    lineHeight: 18,
    flex: 1,
  },
  featureCardSubtitleDisabled: {
    color: '#aaa',
  },
  featureCardArrow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});
