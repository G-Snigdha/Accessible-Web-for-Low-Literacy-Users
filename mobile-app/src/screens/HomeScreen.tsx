import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const features = [
    {
      title: '✨ Text Simplifier',
      description: 'Make complex text easier to read with simple words',
      action: () => navigation.navigate('Reader', { mode: 'simplify' }),
    },
    {
      title: '📝 Text Rewriter',
      description: 'Improve clarity and readability of any text',
      action: () => navigation.navigate('Reader', { mode: 'rewrite' }),
    },
    {
      title: '🌍 Translator',
      description: 'Translate text to your preferred language',
      action: () => navigation.navigate('Reader', { mode: 'translate' }),
    },
    {
      title: '🔊 Read Aloud',
      description: 'Listen to text being read out loud',
      action: () => navigation.navigate('Reader', { mode: 'read-aloud' }),
    },
    {
      title: '✏️ Proofreader',
      description: 'Check spelling and grammar mistakes',
      action: () => navigation.navigate('Reader', { mode: 'proofread' }),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Accessible Web</Text>
          <Text style={styles.subtitle}>
            Make any text easier to read and understand
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Choose a Feature:</Text>
          
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={styles.featureCard}
              onPress={feature.action}
              activeOpacity={0.7}
            >
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => navigation.navigate('Reader')}
          >
            <Text style={styles.primaryButtonText}>📖 Start Reading</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.secondaryButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            🔒 Privacy-first: All text processing happens securely
          </Text>
          <Text style={styles.infoText}>
            ♿ Designed for accessibility and ease of use
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
  },
  quickActions: {
    marginBottom: 30,
  },
  actionButton: {
    borderRadius: 8,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    borderColor: '#CCCCCC',
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  info: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
  },
  infoText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
});

export default HomeScreen;