import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';

export default function HomeTab() {
  const [showSettings, setShowSettings] = useState(false);
  const [hasPartner, setHasPartner] = useState(false); // TODO: Get from backend
  const [selectedEmoji, setSelectedEmoji] = useState('❤️');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = ['❤️', '💕', '💖', '💗', '💓', '💝', '💞', '💘', '🥰', '😍', '🌹', '💐', '✨', '⭐', '🌟'];

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Call backend to delete account
            Alert.alert('Account Deleted', 'Your account has been deleted.');
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleUnmatch = () => {
    Alert.alert(
      'Unmatch Partner',
      'Are you sure you want to unmatch with your partner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: () => {
            // TODO: Call backend to unmatch partner
            Alert.alert('Unmatched', 'You have been unmatched from your partner.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profiles */}
      <View style={styles.profileRow}>
        <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/profile')}>
          <Text style={styles.profileText}>Your Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
          <Text style={{ fontSize: 32 }}>{selectedEmoji}</Text>
        </TouchableOpacity>
        {hasPartner ? (
          <TouchableOpacity style={styles.profileCard} onPress={() => Alert.alert('Partner Profile', 'View partner details')}>
            <Text style={styles.profileText}>Partner Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.connectCard} onPress={() => router.push('/connect-partner')}>
            <Text style={styles.connectText}>+ Connect Partner</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <View style={styles.emojiPicker}>
          <Text style={styles.emojiPickerTitle}>Choose an emoji:</Text>
          <View style={styles.emojiGrid}>
            {emojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emojiButton}
                onPress={() => {
                  setSelectedEmoji(emoji);
                  setShowEmojiPicker(false);
                }}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Main Feature Buttons */}
      <TouchableOpacity style={styles.featureBtn} onPress={() => router.push('/prayer-list')}>
        <Text style={styles.featureText}>Prayer List</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.featureBtn}>
        <Text style={styles.featureText}>To-Do List</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.featureBtn}>
        <Text style={styles.featureText}>Calendar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.featureBtn}>
        <Text style={styles.featureText}>Anniversary Reminders</Text>
      </TouchableOpacity>

      {/* Settings */}
      <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(!showSettings)}>
        <Text style={styles.settingsText}>⚙️ Settings</Text>
      </TouchableOpacity>

      {/* Settings Menu */}
      {showSettings && (
        <View style={styles.settingsMenu}>
          {hasPartner && (
            <TouchableOpacity style={styles.dangerBtn} onPress={handleUnmatch}>
              <Text style={styles.dangerText}>💔 Unmatch with Partner</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteAccount}>
            <Text style={styles.dangerText}>🗑️ Delete Account</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  profileCard: { padding: 16, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, marginHorizontal: 8 },
  profileText: { fontSize: 16, fontWeight: '600' },
  connectCard: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#8B2332',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginHorizontal: 8,
    backgroundColor: '#f8e5e8',
  },
  connectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B2332',
  },
  featureBtn: {
    width: '100%',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f8e5e8',
    alignItems: 'center',
  },
  featureText: { fontSize: 18, fontWeight: '600' },
  settingsBtn: {
    marginTop: 32,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  settingsText: { fontSize: 16, fontWeight: '500' },
  settingsMenu: {
    width: '100%',
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  dangerBtn: {
    width: '100%',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef4444',
    alignItems: 'center',
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  emojiPicker: {
    width: '100%',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f8e5e8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B2332',
  },
  emojiPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  emojiButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emojiText: {
    fontSize: 28,
  },
});
