import { router, useFocusEffect } from 'expo-router';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '@/contexts/PartnerContext';
import { api } from '@/lib/api';

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
      action: () => Alert.alert('Coming Soon', 'We are still building the anniversary reminders feature. Stay tuned!'),
      disabled: true,
    },
    {
      title: 'To-Do List',
      subtitle: 'Accomplish goals together',
      icon: 'checkmark-circle-outline' as const,
      color: '#C026D3',
      gradient: ['#F5E5FA', '#EBD1F0'],
      action: () => Alert.alert('Coming Soon', 'We are still building the shared to-do list experience. Stay tuned!'),
      disabled: true,
    },
  ]), []);

  return (
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
      )}

      <View style={styles.profileRow}>
        <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/profile')}>
          <Text style={styles.profileText}>{userName || 'Your Profile'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
          <Text style={{ fontSize: 32 }}>{selectedEmoji}</Text>
        </TouchableOpacity>

        {hasPartner && partner ? (
          <TouchableOpacity
            style={[styles.profileCard, styles.partnerCard]}
            onPress={() => router.push('/partner-info')}
          >
            <Text style={styles.partnerEmoji}>{partnerEmoji}</Text>
            <Text style={styles.profileText}>{partner.name || partner.email}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.connectCard} onPress={() => router.push('/connect-partner')}>
            <Text style={styles.connectText}>+ Connect Partner</Text>
          </TouchableOpacity>
        )}
      </View>

      {showEmojiPicker && (
        <View style={styles.emojiPicker}>
          <Text style={styles.emojiPickerTitle}>Choose an emoji:</Text>
          <View style={styles.emojiGrid}>
            {emojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emojiButton}
                onPress={async () => {
                  // 本地立即更新UI
                  setSelectedEmoji(emoji);
                  setShowEmojiPicker(false);
                  // 异步保存到后台
                  try {
                    await api.updateProfile({ emoji });
                  } catch {
                    // Silently handle error
                  }
                }}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.featuresGrid}>
        {featureCards.map((card) => (
          <TouchableOpacity
            key={card.title}
            style={[
              styles.featureBtn,
              card.disabled && styles.featureBtnDisabled
            ]}
            onPress={card.action}
            disabled={card.disabled}
            activeOpacity={0.7}
          >
            <View style={[
              styles.featureIconContainer,
              { backgroundColor: card.gradient[0] }
            ]}>
              <Ionicons
                name={card.icon}
                size={32}
                color={card.disabled ? '#999' : card.color}
              />
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
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8e5e8' },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8B2332',
    marginBottom: 8,
    textShadowColor: 'rgba(139, 35, 50, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  loadingContainer: { alignItems: 'center', marginBottom: 20 },
  loadingText: { marginTop: 8, fontSize: 14, color: '#6b7280' },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  profileCard: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#8B2332',
    borderRadius: 12,
    marginHorizontal: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: { fontSize: 16, fontWeight: '600', color: '#8B2332' },
  connectCard: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#8B2332',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginHorizontal: 8,
    backgroundColor: '#f8e5e8',
  },
  connectText: { fontSize: 16, fontWeight: '600', color: '#8B2332' },
  featuresGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  featureBtn: {
    width: '47%',
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f5c8d2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B2332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 160,
  },
  featureBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B2332',
    textAlign: 'center',
    marginBottom: 6,
  },
  featureTitleDisabled: {
    color: '#999',
  },
  featureSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  featureSubtitleDisabled: {
    color: '#aaa',
  },
  emojiPicker: { width: '100%', padding: 16, marginBottom: 16, backgroundColor: '#f8e5e8', borderRadius: 12, borderWidth: 1, borderColor: '#8B2332' },
  emojiPickerTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  emojiButton: { padding: 8, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  emojiText: { fontSize: 28 },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  partnerEmoji: {
    fontSize: 32,
    marginRight: 8,
  },
});
