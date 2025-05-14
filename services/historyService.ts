import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_STORAGE_KEY = 'rng_analysis_history_v2'; // Changed key to avoid old data conflicts

// This structure should reflect what you want to store and display from the API response
export type AnalysisResultForHistory = {
  predicted_class_name: string;
  probability: number; // Probability of the predicted class, or a primary probability score
  // Optional: store all probabilities if your history view needs them
  // all_probabilities?: { [key: string]: number }; 
  // Optional: other details like file_size_bytes, processing_time_seconds
  // input_file_size_bytes?: number; 
};

export type HistoryItem = {
  filename: string;
  timestamp: string;
  results: AnalysisResultForHistory; // Use the new structure
  // Optional: fileSize if you decide to store it in index.tsx
  // fileSize?: number;
};

export const saveAnalysisToHistory = async (item: HistoryItem): Promise<void> => {
  try {
    const historyString = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    const history: HistoryItem[] = historyString ? JSON.parse(historyString) : [];
    
    history.unshift(item); // Add new item to the beginning
    
    const limitedHistory = history.slice(0, 50); // Limit history size
    
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error saving to history:', error);
    throw error; // Re-throw to allow UI to handle if needed
  }
};

export const getAnalysisHistory = async (): Promise<HistoryItem[]> => {
  try {
    const historyString = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    return historyString ? JSON.parse(historyString) : [];
  } catch (error) {
    console.error('Error getting history:', error);
    return []; // Return empty array on error to prevent app crash
  }
};

export const clearHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
};