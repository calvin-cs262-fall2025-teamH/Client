import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Collage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shared Photo Collage</Text>
      <TouchableOpacity style={styles.uploadBtn}>
        <Text style={styles.uploadText}>+ Upload Photo</Text>
      </TouchableOpacity>
      <Text style={{ marginTop: 20 }}>Timeline and Year in Review will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  uploadBtn: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  uploadText: { fontSize: 16, fontWeight: '600' },
});
