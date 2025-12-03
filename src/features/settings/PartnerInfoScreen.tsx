import { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, RefreshControl, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { api } from '@/lib/api';

export function PartnerInfoScreen() {
  const [partnerInfo, setPartnerInfo] = useState<{ id: number; email: string; name: string | null } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPartnerInfo = async () => {
    try {
      const response = await api.getProfile();
      if (response.data?.partner) {
        setPartnerInfo(response.data.partner);
      }
    } catch (error) {
      console.error('Failed to load partner info:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPartnerInfo();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPartnerInfo();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B2332" />
          <Text style={styles.loadingText}>Loading partner info...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!partnerInfo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.noPartnerText}>No partner connected</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
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
          <Text style={styles.headerText}>💑 Partner Information</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{partnerInfo.name || 'Not set'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{partnerInfo.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>{partnerInfo.dateOfBirth || 'Not set'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Major:</Text>
            <Text style={styles.value}>{partnerInfo.major || 'Not set'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Year:</Text>
            <Text style={styles.value}>{partnerInfo.year || 'Not set'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Hobby:</Text>
            <Text style={styles.value}>{partnerInfo.hobby || 'Not set'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Emoji:</Text>
            <Text style={styles.emojiValue}>{partnerInfo.emoji || '😭'}</Text>
          </View>

          {partnerInfo.createdAt && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Joined:</Text>
              <Text style={styles.value}>
                {new Date(partnerInfo.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.noteText}>
          Pull down to refresh partner information
        </Text>
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
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B2332',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  emojiValue: {
    fontSize: 32,
  },
  noPartnerText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  noteText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 12,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8e5e8',
  },
  backButtonText: {
    fontSize: 16,
    color: '#8B2332',
    fontWeight: '600',
  },
});
