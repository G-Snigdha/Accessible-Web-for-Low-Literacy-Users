import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';

interface ReaderScreenProps {
  navigation: any;
  route: any;
}

interface ProcessingResult {
  processed_text: string;
  analysis?: {
    word_count: number;
    sentence_count: number;
    reading_level: {
      grade: number;
      level: string;
    };
  };
}

const ReaderScreen: React.FC<ReaderScreenProps> = ({ navigation, route }) => {
  const [inputText, setInputText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [analysis, setAnalysis] = useState<any>(null);
  
  const initialMode = route?.params?.mode || 'simplify';

  const API_BASE_URL = 'http://localhost:3001/api';

  const processText = async (action: string) => {
    if (!inputText.trim()) {
      Alert.alert('No Text', 'Please enter some text to process.');
      return;
    }

    setIsProcessing(true);
    setCurrentAction(action);

    try {
      const response = await fetch(`${API_BASE_URL}/text/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          action: action,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        if (action === 'analyze') {
          setAnalysis(result.data);
        } else {
          setProcessedText(result.data.processed_text);
          if (result.data.analysis) {
            setAnalysis(result.data.analysis);
          }
        }
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      Alert.alert(
        'Processing Error',
        `Failed to process text: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsProcessing(false);
      setCurrentAction('');
    }
  };

  const readAloud = async (text?: string) => {
    const textToRead = text || processedText || inputText;
    if (!textToRead.trim()) {
      Alert.alert('No Text', 'No text available to read aloud.');
      return;
    }

    try {
      Speech.speak(textToRead, {
        language: 'en',
        pitch: 1.0,
        rate: 0.8,
      });
    } catch (error) {
      Alert.alert('Speech Error', 'Failed to read text aloud.');
    }
  };

  const stopReading = () => {
    Speech.stop();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', 'Text copied to clipboard!');
    } catch (error) {
      Alert.alert('Copy Error', 'Failed to copy text to clipboard.');
    }
  };

  const clearText = () => {
    setInputText('');
    setProcessedText('');
    setAnalysis(null);
    Speech.stop();
  };

  const actionButtons = [
    { action: 'simplify', title: '✨ Simplify', color: '#FFFFFF' },
    { action: 'rewrite', title: '📝 Rewrite', color: '#FFFFFF' },
    { action: 'translate', title: '🌍 Translate', color: '#FFFFFF' },
    { action: 'proofread', title: '✏️ Proofread', color: '#FFFFFF' },
    { action: 'analyze', title: '📊 Analyze', color: '#FFFFFF' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Enter Your Text:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Paste or type text here to make it easier to read..."
            placeholderTextColor="#666666"
            multiline
            numberOfLines={8}
            value={inputText}
            onChangeText={setInputText}
            textAlignVertical="top"
          />
          
          <View style={styles.inputActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={clearText}
            >
              <Text style={styles.buttonText}>🗑️ Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Choose an Action:</Text>
          <View style={styles.buttonGrid}>
            {actionButtons.map((button) => (
              <TouchableOpacity
                key={button.action}
                style={[
                  styles.actionButton,
                  { backgroundColor: button.color },
                  isProcessing && styles.disabledButton,
                ]}
                onPress={() => processText(button.action)}
                disabled={isProcessing || !inputText.trim()}
              >
                {isProcessing && currentAction === button.action ? (
                  <ActivityIndicator color="#000000" size="small" />
                ) : (
                  <Text style={styles.buttonText}>{button.title}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Results Section */}
        {(processedText || analysis) && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Results:</Text>
            
            {processedText && (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Processed Text:</Text>
                <Text style={styles.resultText}>{processedText}</Text>
                
                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => readAloud(processedText)}
                  >
                    <Text style={styles.smallButtonText}>🔊 Read</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => copyToClipboard(processedText)}
                  >
                    <Text style={styles.smallButtonText}>📋 Copy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={stopReading}
                  >
                    <Text style={styles.smallButtonText}>⏹️ Stop</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {analysis && (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Text Analysis:</Text>
                {analysis.word_count && (
                  <Text style={styles.analysisText}>📊 {analysis.word_count} words</Text>
                )}
                {analysis.sentence_count && (
                  <Text style={styles.analysisText}>📝 {analysis.sentence_count} sentences</Text>
                )}
                {analysis.reading_level && (
                  <Text style={styles.analysisText}>
                    📈 Reading Level: Grade {analysis.reading_level.grade} ({analysis.reading_level.level})
                  </Text>
                )}
                {analysis.complexity_score && (
                  <Text style={styles.analysisText}>
                    🎯 Complexity Score: {analysis.complexity_score}/10
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Speech Controls */}
        <View style={styles.speechSection}>
          <Text style={styles.sectionTitle}>Speech Controls:</Text>
          <View style={styles.speechButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => readAloud()}
            >
              <Text style={styles.buttonText}>🔊 Read Original</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={stopReading}
            >
              <Text style={styles.buttonText}>⏹️ Stop Reading</Text>
            </TouchableOpacity>
          </View>
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
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    color: '#000000',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  clearButton: {
    backgroundColor: '#F8F9FA',
    borderColor: '#CCCCCC',
  },
  actionsSection: {
    marginBottom: 24,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    width: '48%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  resultsSection: {
    marginBottom: 24,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    marginBottom: 12,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 12,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  smallButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  analysisText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
    lineHeight: 22,
  },
  speechSection: {
    marginBottom: 24,
  },
  speechButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ReaderScreen;