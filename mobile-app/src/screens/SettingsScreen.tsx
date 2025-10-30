import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsScreenProps {
  navigation: any;
}

interface UserSettings {
  fontSize: number;
  speechRate: number;
  speechPitch: number;
  autoRead: boolean;
  darkMode: boolean;
  language: string;
  simplificationLevel: string;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<UserSettings>({
    fontSize: 16,
    speechRate: 0.8,
    speechPitch: 1.0,
    autoRead: false,
    darkMode: false,
    language: 'en',
    simplificationLevel: 'moderate',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load settings from AsyncStorage
  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      setIsLoading(true);
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      Alert.alert('Settings Saved', 'Your preferences have been saved successfully.');
    } catch (error) {
      Alert.alert('Save Error', 'Failed to save settings. Please try again.');
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultSettings: UserSettings = {
              fontSize: 16,
              speechRate: 0.8,
              speechPitch: 1.0,
              autoRead: false,
              darkMode: false,
              language: 'en',
              simplificationLevel: 'moderate',
            };
            saveSettings(defaultSettings);
          },
        },
      ]
    );
  };

  const fontSizes = [12, 14, 16, 18, 20, 22, 24];
  const speechRates = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2];
  const speechPitches = [0.8, 0.9, 1.0, 1.1, 1.2];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
  ];
  const simplificationLevels = ['basic', 'moderate', 'advanced'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Display Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Font Size</Text>
            <View style={styles.buttonRow}>
              {fontSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    settings.fontSize === size && styles.selectedOption,
                  ]}
                  onPress={() => updateSetting('fontSize', size)}
                >
                  <Text style={[
                    styles.optionText,
                    settings.fontSize === size && styles.selectedOptionText,
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.switchRow}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => updateSetting('darkMode', value)}
                trackColor={{ false: '#CCCCCC', true: '#000000' }}
                thumbColor={settings.darkMode ? '#FFFFFF' : '#000000'}
              />
            </View>
          </View>
        </View>

        {/* Speech Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔊 Speech Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Speech Rate</Text>
            <View style={styles.buttonRow}>
              {speechRates.map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[
                    styles.optionButton,
                    settings.speechRate === rate && styles.selectedOption,
                  ]}
                  onPress={() => updateSetting('speechRate', rate)}
                >
                  <Text style={[
                    styles.optionText,
                    settings.speechRate === rate && styles.selectedOptionText,
                  ]}>
                    {rate}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Speech Pitch</Text>
            <View style={styles.buttonRow}>
              {speechPitches.map((pitch) => (
                <TouchableOpacity
                  key={pitch}
                  style={[
                    styles.optionButton,
                    settings.speechPitch === pitch && styles.selectedOption,
                  ]}
                  onPress={() => updateSetting('speechPitch', pitch)}
                >
                  <Text style={[
                    styles.optionText,
                    settings.speechPitch === pitch && styles.selectedOptionText,
                  ]}>
                    {pitch}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.switchRow}>
              <Text style={styles.settingLabel}>Auto-Read Results</Text>
              <Switch
                value={settings.autoRead}
                onValueChange={(value) => updateSetting('autoRead', value)}
                trackColor={{ false: '#CCCCCC', true: '#000000' }}
                thumbColor={settings.autoRead ? '#FFFFFF' : '#000000'}
              />
            </View>
          </View>
        </View>

        {/* Language Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 Language Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Preferred Language</Text>
            <View style={styles.languageGrid}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageButton,
                    settings.language === lang.code && styles.selectedOption,
                  ]}
                  onPress={() => updateSetting('language', lang.code)}
                >
                  <Text style={[
                    styles.optionText,
                    settings.language === lang.code && styles.selectedOptionText,
                  ]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Processing Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Processing Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Simplification Level</Text>
            <View style={styles.buttonRow}>
              {simplificationLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelButton,
                    settings.simplificationLevel === level && styles.selectedOption,
                  ]}
                  onPress={() => updateSetting('simplificationLevel', level)}
                >
                  <Text style={[
                    styles.optionText,
                    settings.simplificationLevel === level && styles.selectedOptionText,
                  ]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ App Information</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.appTitle}>Accessible Text Reader</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Making text easier to read and understand for everyone. 
              This app helps simplify complex text, provides text-to-speech, 
              and offers accessibility features for low-literacy users.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={resetToDefaults}
            disabled={isLoading}
          >
            <Text style={styles.resetButtonText}>🔄 Reset to Defaults</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.backButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>← Back to Home</Text>
          </TouchableOpacity>
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
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 2,
    minWidth: 50,
  },
  languageButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 4,
    width: '48%',
  },
  levelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 4,
    flex: 1,
  },
  selectedOption: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  optionText: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  actionSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  resetButton: {
    backgroundColor: '#F8F9FA',
    borderColor: '#FF6B6B',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

export default SettingsScreen;