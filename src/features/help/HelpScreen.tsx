import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface HelpSection {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  content: string[];
}

const helpSections: HelpSection[] = [
  {
    id: 'account',
    title: 'Section 1: Creating An Account',
    icon: 'person-add-outline',
    content: [
      'Welcome to CoupleBond! To get started, you\'ll need to create an account. The registration process is quick and easy.',
      '',
      'Registration Requirements:',
      '• Email must use either @gmail.com or @calvin.edu domain',
      '• Password must be at least 6 characters long (can include letters and numbers)',
      '',
      'Steps to Register:',
      '1. Open the CoupleBond app',
      '2. On the welcome screen, you\'ll see options to Login or Register',
      '3. Tap "Register" if you\'re a new user',
      '4. Enter your email address (must be @gmail.com or @calvin.edu)',
      '5. Create a secure password (minimum 6 characters)',
      '6. Tap the "Register" button',
      '7. Once registered, tap "Login" to sign in with your new credentials',
      '',
      '💡 Tip: Choose a password you\'ll remember but that\'s secure. Consider using a mix of letters and numbers!',
    ],
  },
  {
    id: 'connect',
    title: 'Section 2: Connecting With Your Partner\'s Account',
    icon: 'heart-outline',
    content: [
      'After creating your account, you\'ll need to connect with your partner to unlock all of CoupleBond\'s features. This creates a shared space for your memories, prayers, and events.',
      '',
      'How Partner Connection Works:',
      'One person generates a unique connection code, and the other person enters that code to establish the connection. It\'s simple and secure!',
      '',
      'Steps to Connect:',
      '1. Both you and your partner should have CoupleBond accounts created',
      '2. From the Home page, tap the "+ Connect Partner" button',
      '3. You\'ll see two sections: "Your Connection Code" and "Enter Partner\'s Code"',
      '',
      'Option A - Generate a code for your partner:',
      '• Tap "Generate Code" under "Your Connection Code"',
      '• Share this code with your partner (via text, in person, etc.)',
      '• Your partner will enter this code on their device',
      '',
      'Option B - Enter your partner\'s code:',
      '• Have your partner generate their code first',
      '• Enter their code in the "Enter Partner\'s Code" field',
      '• Tap "Connect" to establish the connection',
      '',
      '✨ Once connected, you\'ll both have access to shared memories, prayers, calendar events, and more!',
    ],
  },
  {
    id: 'emoji',
    title: 'Section 3: Change Emoji Status',
    icon: 'happy-outline',
    content: [
      'Express how you\'re feeling about your relationship with a fun emoji! This emoji appears at the top of your home screen and is visible to both you and your partner.',
      '',
      'How to Update Your Emoji Status:',
      '1. Navigate to the Home screen',
      '2. Look at the top of the screen where you\'ll see an emoji displayed between you and your partner\'s names',
      '3. Tap on the current emoji',
      '4. A selection of emojis will appear',
      '5. Choose your desired emoji to express your current mood or relationship status',
      '6. The emoji will update immediately for both you and your partner',
      '',
      'Popular Emoji Choices:',
      '• ❤️ Feeling loved and connected',
      '• 😊 Happy and content',
      '• 🥰 Extra affectionate',
      '• 💑 Celebrating your relationship',
      '',
      '💡 Tip: Use this feature to communicate your feelings throughout the day. It\'s a quick way to stay connected!',
    ],
  },
  {
    id: 'memory',
    title: 'Section 4: Add a Memory',
    icon: 'images-outline',
    content: [
      'Capture and preserve your special moments together! The Collage feature lets you create beautiful memories with photos and descriptions that you can look back on anytime.',
      '',
      'Creating a New Memory:',
      '1. Tap the "Collage" tab at the bottom right of the screen (📸 icon)',
      '2. Tap the "+" button to create a new memory',
      '3. Fill in the memory details:',
      '   • Title: Give your memory a meaningful name (e.g., "First Date", "Beach Trip")',
      '   • Date: When did this memory happen?',
      '   • Description: Add any details or notes you want to remember',
      '   • Location (optional): Where did this take place?',
      '4. Tap "Create Memory" to save',
      '',
      'Adding Photos to Your Memory:',
      'Once your memory is created, bring it to life with photos!',
      '',
      '1. Tap on the memory you just created to open it',
      '2. Look for the camera icon (usually in the bottom right corner)',
      '3. Tap the camera icon',
      '4. Choose your photo source:',
      '   • "Take Photo" - Capture a new photo with your camera',
      '   • "Choose from Library" - Select existing photos from your device',
      '5. Select or take your photo',
      '6. The photo will be added to your memory',
      '7. Repeat to add multiple photos to the same memory!',
      '',
      '📸 Pro Tip: You can add multiple photos to each memory. Create a photo album for each special occasion!',
      '',
      '💡 Memories are shared with your partner, so you can both add photos and reminisce together.',
    ],
  },
  {
    id: 'prayer',
    title: 'Section 5: Add a Prayer to the Prayer List',
    icon: 'hand-right-outline',
    content: [
      'Keep track of your prayer requests and celebrate answered prayers together. The Prayer List is a shared space where you and your partner can support each other spiritually.',
      '',
      'Adding a Prayer Request:',
      '1. From the Home page, tap on the "Prayer List" icon',
      '2. Tap "Add Prayer" at the top right corner',
      '3. Enter your prayer details:',
      '   • Prayer request text: What would you like to pray for?',
      '   • You can be as detailed or brief as you\'d like',
      '   • Both you and your partner will be able to see this prayer',
      '4. Tap "Done" to save your prayer to the list',
      '',
      'Managing Your Prayers:',
      '• View all prayers: Scroll through your shared prayer list',
      '• Mark as answered: When a prayer is answered, tap it and mark it as "Read" or "Answered"',
      '• Both partners can add prayers and mark them as answered',
      '',
      '🙏 Prayer List Benefits:',
      '• Stay spiritually connected with your partner',
      '• Remember what you\'re praying for together',
      '• Celebrate answered prayers as a couple',
      '• Support each other through challenges',
      '',
      '💡 Tip: Make it a habit to review your prayer list together regularly. It\'s a beautiful way to see how God is working in your relationship!',
    ],
  },
  {
    id: 'calendar',
    title: 'Section 6: Add a Calendar Event',
    icon: 'calendar-outline',
    content: [
      'Keep track of important dates and events with your partner!',
      '',
      '• From the home page, tap on the "Calendar" icon.',
      '• Tap the "+" button or "Add Event" to create a new event.',
      '• Fill in the event details:',
      '  - Event title',
      '  - Date and time',
      '  - Optional description or notes',
      '• Click "Save" or "Create Event".',
      '• Your event will now appear on the calendar and be visible to both you and your partner.',
    ],
  },
  {
    id: 'dailybread',
    title: 'Section 7: Daily Bread (Devotionals)',
    icon: 'book-outline',
    content: [
      'Grow spiritually together with shared devotionals and Bible reading plans.',
      '',
      'Daily Bread Features:',
      '• Couples Plan: Curated devotionals specifically for couples to read together.',
      '• Bible in Year: A plan to read through the Bible in a year.',
      '',
      'Using the Couples Plan:',
      '1. Tap the "Daily Bread" icon on the home screen.',
      '2. Select the "Couples" tab.',
      '3. Tap on a devotional to read it.',
      '4. Mark it as read when you\'re done to track your progress.',
      '',
      'Using Bible in Year:',
      '1. Select the "Bible in Year" tab.',
      '2. You can follow the standard plan or add your own chapters.',
      '3. To add chapters: Tap "Add Chapters", select the book and chapters, and click "Add to Plan".',
      '4. To remove chapters: Long press an item to enter selection mode, select items, and tap "Delete".',
      '',
      '💡 Tip: Read the daily devotional together and discuss the reflection questions to deepen your spiritual bond.',
    ],
  },
  {
    id: 'unmatch',
    title: 'Section 8: Unmatching With Your Partner',
    icon: 'heart-dislike-outline',
    content: [
      'If you need to disconnect from your current partner, you can unmatch.',
      '',
      '⚠️ Warning: This action will remove the connection between you and your partner. All shared data may be affected.',
      '',
      '• Navigate to the Settings tab (⚙️ icon) at the bottom left.',
      '• Scroll down to the "Danger Zone" section.',
      '• Tap "Unmatch with Partner".',
      '• Confirm the action when prompted.',
      '• You will be disconnected from your partner and can connect with a new partner if desired.',
    ],
  },
];

export function HelpScreen() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['account']));

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.introCard}>
          <Ionicons name="help-circle" size={48} color="#8B2332" />
          <Text style={styles.introTitle}>Welcome to CoupleBond Help</Text>
          <Text style={styles.introText}>
            Find answers to common questions and learn how to use all the features of CoupleBond.
          </Text>
        </View>

        {helpSections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          return (
            <View key={section.id} style={styles.sectionCard}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(section.id)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionHeaderLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name={section.icon} size={22} color="#8B2332" />
                  </View>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color="#8B2332"
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.sectionContent}>
                  {section.content.map((line, index) => (
                    <Text
                      key={index}
                      style={[
                        styles.contentText,
                        line === '' && styles.emptyLine,
                        line.startsWith('Section') && styles.subsectionTitle,
                      ]}
                    >
                      {line}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Need more help?</Text>
          <Text style={styles.footerSubtext}>
            Contact support or visit our website for additional resources.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#8B2332',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  introCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginTop: 12,
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8e5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
    backgroundColor: '#fafafa',
  },
  contentText: {
    fontSize: 15,
    color: '#34495e',
    lineHeight: 24,
    marginBottom: 4,
  },
  emptyLine: {
    height: 8,
  },
  subsectionTitle: {
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 4,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 15,
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
});
