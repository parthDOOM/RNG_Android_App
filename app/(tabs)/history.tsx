import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Clock, Trash2 } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import { getAnalysisHistory, clearHistory, HistoryItem } from '@/services/historyService'; // Import new HistoryItem
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';

// Match this with the classDetails in AnalysisResultCard or a shared mapping
const historyClassDisplay: { [key: string]: { displayName: string, isVulnerable: boolean } } = {
  "Healthy": { displayName: "Healthy", isVulnerable: false },
  "Biased": { displayName: "Biased", isVulnerable: true },
  "Stuck_00": { displayName: "Stuck at 0x00", isVulnerable: true },
  "Stuck_FF": { displayName: "Stuck at 0xFF", isVulnerable: true },
  "ReducedEntropy": { displayName: "Reduced Entropy", isVulnerable: true },
  "Periodic": { displayName: "Periodic", isVulnerable: true },
  "Correlated": { displayName: "Correlated", isVulnerable: true },
  "LCG_Flawed": { displayName: "LCG-like Flaw", isVulnerable: true },
  "Unknown Class": { displayName: "Unknown", isVulnerable: true } // Fallback
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAnalysisHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
      Alert.alert("Error", "Could not load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadHistory();
    }
  }, [isFocused, loadHistory]);

  const handleClearHistory = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all analysis history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive", 
          onPress: async () => {
            try {
              await clearHistory();
              setHistory([]);
            } catch (error) {
              console.error('Failed to clear history:', error);
              Alert.alert("Error", "Could not clear history.");
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        });
    } catch (e) {
        return 'Invalid Date';
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const { predicted_class_name, probability } = item.results;
    
    const displayInfo = historyClassDisplay[predicted_class_name] || historyClassDisplay["Unknown Class"];
    const isVulnerable = displayInfo.isVulnerable;

    return (
      <TouchableOpacity
        style={[
          styles.historyCard,
          isVulnerable ? styles.vulnerableCard : styles.healthyCard,
        ]}
        // onPress={() => Alert.alert("History Item", `File: ${item.filename}\nStatus: ${displayInfo.displayName}`)}
      >
        <View style={styles.historyCardHeader}>
          <Text style={styles.filename} numberOfLines={1} ellipsizeMode="middle">{item.filename}</Text>
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Status:</Text>
          <Text
            style={[
              styles.resultValue,
              isVulnerable ? styles.vulnerableText : styles.healthyText,
            ]}
          >
            {displayInfo.displayName}
          </Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Confidence:</Text>
          <Text style={styles.resultValue}>
            {(probability * 100).toFixed(2)}%
          </Text>
        </View>
        {/* You can add more details here if stored, e.g., item.fileSize */}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Analysis History" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Analysis History" />

      <View style={styles.content}>
        {history.length > 0 ? (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.historyCount}>
                {history.length} Stored {history.length === 1 ? 'Analysis' : 'Analyses'}
              </Text>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearHistory}
              >
                <Trash2 size={16} color="#64748B" />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={history}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item.filename}-${item.timestamp}-${index}`}
              contentContainerStyle={styles.historyList}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <EmptyState
            icon={<Clock size={48} color="#94A3B8" />}
            title="No Analysis History"
            message="Your previous RNG analyses will appear here once saved."
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Background color for the whole screen
  },
  content: {
    flex: 1,
    paddingHorizontal: 16, // Horizontal padding for the main content area
    paddingTop: 16, // Padding at the top of the content area
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16, // Space below the header row
    paddingHorizontal: 8, // Slight horizontal padding for this row if needed
  },
  historyCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 15, // Slightly smaller for a less dominant look
    color: '#475569', // Slate-600
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12, // More padding for better touch target
    backgroundColor: '#E2E8F0', // Light background for button
    borderRadius: 6,
  },
  clearButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#334155', // Darker text for better contrast
    marginLeft: 6,
  },
  historyList: {
    paddingBottom: 24, // Ensure space at the bottom of the list
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10, // Slightly less rounded
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // Softer shadow
    shadowOpacity: 0.08, // Lighter shadow
    shadowRadius: 3,
    elevation: 2, // For Android shadow
    borderLeftWidth: 5, // Prominent side border
  },
  healthyCard: {
    borderLeftColor: '#10B981', // Green-500
  },
  vulnerableCard: {
    borderLeftColor: '#EF4444', // Red-500
  },
  historyCardHeader: {
    marginBottom: 10, // Adjusted spacing
  },
  filename: {
    fontFamily: 'SpaceMono-Regular', // Monospaced for filenames
    fontSize: 15,
    color: '#0F172A', // Slate-900 (very dark gray)
    marginBottom: 4,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B', // Slate-500 (medium gray)
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // Adjusted spacing
  },
  resultLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#475569', // Slate-600
    width: 90, // Fixed width for alignment
  },
  resultValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E293B', // Slate-800 (dark gray)
    flexShrink: 1, // Allow text to wrap if too long
  },
  healthyText: {
    color: '#059669', // Green-600
  },
  vulnerableText: {
    color: '#DC2626', // Red-600
  },
});