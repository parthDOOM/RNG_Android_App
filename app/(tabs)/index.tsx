import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
// FileSystem is not directly needed here anymore for reading content for the API call
// import * as FileSystem from 'expo-file-system';
import { Upload, FileUp, AlertCircle } from 'lucide-react-native';
import { analyzeFileWithApi, ApiPredictionResponse } from '@/services/api'; // Updated import
import Header from '@/components/Header';
import AnalysisResultCard from '@/components/AnalysisResultCard';
import { saveAnalysisToHistory, HistoryItem } from '@/services/historyService'; // Updated import for HistoryItem
import { DocumentPickerAsset } from 'expo-document-picker';

export default function AnalyzerScreen() {
  const [selectedFile, setSelectedFile] = useState<DocumentPickerAsset | null>(
    null
  );
  // fileContent is no longer needed to be stored as base64 for API call
  // const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ApiPredictionResponse | null>(null); // Use new type
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/octet-stream', // More specific for .bin files
        // Or use '*/*' for any file type if .bin is not consistently octet-stream
        // type: ['application/octet-stream', 'application/macbinary'], // Example for .bin
        copyToCacheDirectory: true, // Important for FormData to access the file
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setSelectedFile(null);
        // setFileContent(null);
        return;
      }

      const pickedFile = result.assets[0];
      
      // Validate file type if necessary (e.g., check for .bin extension)
      if (!pickedFile.name.toLowerCase().endsWith('.bin')) {
        Alert.alert('Invalid File Type', 'Please select a .bin file.');
        setSelectedFile(null);
        // setFileContent(null);
        return;
      }

      setSelectedFile(pickedFile);
      setResults(null); // Clear previous results
      setError(null); // Clear previous errors
      // No need to call readFileContent here for the API call itself
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during document picking.';
      setError(`Error picking document: ${errorMessage}`);
      console.error('Document picker error:', err);
      setSelectedFile(null);
      // setFileContent(null);
    }
  };

  // readFileContent is no longer needed for the primary API interaction logic
  // const readFileContent = async (uri: string) => { ... };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      Alert.alert('No File', 'Please select a .bin file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Pass the whole fileAsset to the API service
      const analysisResults = await analyzeFileWithApi(selectedFile);
      setResults(analysisResults);

      if (analysisResults && selectedFile) {
        // Adapt to new HistoryItem structure if needed (see historyService.ts update)
        const historyEntry: HistoryItem = {
          filename: selectedFile.name,
          timestamp: new Date().toISOString(),
          // Store the relevant parts of the API response for history
          results: { // This structure needs to match HistoryItem.results
            predicted_class_name: analysisResults.predicted_class_name,
            // Decide what from 'probabilities' you want to store or a primary probability
            // For simplicity, let's store the probability of the predicted class
            // You might want to store the whole probabilities object if your history card can show it
            probability: analysisResults.probabilities[analysisResults.predicted_class_name] || 0,
            // You can add more fields from ApiPredictionResponse if needed in history
            // For example: all_probabilities: analysisResults.probabilities
          },
          // Optional: Add other details like file size for history display
          // fileSize: analysisResults.input_file_size_bytes, 
        };
        await saveAnalysisToHistory(historyEntry);
      }

      if (scrollViewRef.current) {
        (scrollViewRef.current as any).scrollToEnd({ animated: true });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown analysis error occurred.';
      setError(`Analysis failed: ${errorMessage}`);
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    // setFileContent(null);
    setResults(null);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <Header title="RNG Analyzer" /> */}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.uploadSection}>
          <View style={styles.uploadCard}>
            <Upload size={48} color="#6366F1" style={styles.uploadIcon} />
            <Text style={styles.uploadTitle}>Upload RNG Data for Analysis</Text>
            <Text style={styles.uploadDescription}>
              Select a binary (.bin) file from your random number generator.
            </Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleDocumentPick}
              disabled={isLoading}
            >
              <FileUp size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Select .bin File</Text>
            </TouchableOpacity>

            {selectedFile && (
              <View style={styles.fileInfoContainer}>
                <Text style={styles.fileInfoTitle}>Selected File</Text>
                <Text style={styles.fileName}>{selectedFile.name}</Text>
                <Text style={styles.fileDetails}>
                  Size: {selectedFile.size ? (selectedFile.size / 1024).toFixed(2) + ' KB' : 'N/A'}
                </Text>
                <Text style={styles.fileDetails}>
                  Type: {selectedFile.mimeType || 'binary'}
                </Text>
              </View>
            )}
          </View>

          {selectedFile && (
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                isLoading || !selectedFile ? styles.disabledButton : null,
              ]}
              onPress={handleAnalyze}
              disabled={isLoading || !selectedFile}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Analyze RNG Data</Text>
              )}
            </TouchableOpacity>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {results && (
          <View style={styles.resultsSection}>
            {/* Ensure AnalysisResultCard is adapted for ApiPredictionResponse */}
            <AnalysisResultCard apiResponse={results} />
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetAnalysis}
            >
              <Text style={styles.resetButtonText}>Start New Analysis</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  uploadIcon: {
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
  },
  analyzeButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 8, // Ensure space if icon is present
  },
  fileInfoContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  fileInfoTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  fileName: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  fileDetails: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#B91C1C',
    marginLeft: 8,
    flexShrink: 1, // Allow text to wrap
  },
  resultsSection: {
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#475569',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});