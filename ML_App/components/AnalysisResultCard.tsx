import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, ShieldAlert, AlertTriangle, Percent } from 'lucide-react-native';
import { ApiPredictionResponse } from '@/services/api'; // Import the response type

type AnalysisResultCardProps = {
  apiResponse: ApiPredictionResponse; // Use the new API response type
};

// Mapping from API's predicted_class_name to display names and details
// This should be updated to match the exact class names from your API's RNG_CLASSES
const classDetails: { 
    [key: string]: { 
        displayName: string; 
        explanation?: string; 
        improvement?: string;
        isVulnerable: boolean;
    } 
} = {
  "Healthy": { 
    displayName: "Healthy", 
    isVulnerable: false,
    explanation: "The analysis indicates that your random number generator exhibits good statistical properties with no obvious patterns that could lead to predictability.",
    improvement: "Remember that even statistically sound RNGs need proper implementation and deployment to remain secure in practice."
  },
  "Biased": { 
    displayName: "Biased", 
    isVulnerable: true,
    explanation: "Your RNG sequence shows statistical bias, meaning some values are more likely to occur than others, reducing its randomness.",
    improvement: "Investigate the source of bias. Ensure data sources are truly random and processing steps don't introduce predictability. Consider using cryptographic whitening techniques."
  },
  "Stuck_00": { 
    displayName: "Stuck at 0x00", 
    isVulnerable: true,
    explanation: "The RNG sequence is predominantly stuck at the byte value 0x00, indicating a critical failure in the generator.",
    improvement: "This is a severe flaw. The RNG hardware or software is likely malfunctioning. Replace or repair the RNG unit immediately."
  },
  "Stuck_FF": { 
    displayName: "Stuck at 0xFF", 
    isVulnerable: true,
    explanation: "The RNG sequence is predominantly stuck at the byte value 0xFF, indicating a critical failure in the generator.",
    improvement: "This is a severe flaw. The RNG hardware or software is likely malfunctioning. Replace or repair the RNG unit immediately."
  },
  "ReducedEntropy": { 
    displayName: "Reduced Entropy", 
    isVulnerable: true,
    explanation: "Your RNG sequence has lower entropy than expected, making it less random and potentially more predictable.",
    improvement: "Improve entropy sources by combining hardware noise, timing variations, and system state. Consider using specialized hardware entropy sources or post-processing with cryptographic hash functions."
  },
  "Periodic": { 
    displayName: "Periodic", 
    isVulnerable: true,
    explanation: "The RNG sequence exhibits periodic patterns, meaning the sequence repeats itself after a certain interval, making it predictable.",
    improvement: "This suggests a flawed algorithm (like a short-period LCG) or a malfunctioning hardware source. Use a generator with a much larger period or a CSPRNG."
  },
  "Correlated": { 
    displayName: "Correlated", 
    isVulnerable: true,
    explanation: "The RNG sequence shows correlations between its values, meaning future values can be partially predicted from past values.",
    improvement: "Review the generation algorithm. Apply de-correlation techniques or switch to a more robust RNG design like a CSPRNG."
  },
  "LCG_Flawed": { 
    displayName: "LCG-like Flaw", 
    isVulnerable: true,
    explanation: "Your RNG shows patterns consistent with a flawed Linear Congruential Generator (LCG), which is predictable once enough outputs are observed.",
    improvement: "Replace with a cryptographically secure RNG like ChaCha20 or use a hardware RNG. At minimum, combine with other sources of entropy if LCGs must be used for non-crypto purposes."
  },
  // Add other classes from your API's RNG_CLASSES here
  "Unknown Class": { // Fallback for unmapped classes
    displayName: "Unknown Flaw",
    isVulnerable: true,
    explanation: "An unrecognized flaw type was detected. The RNG may have unusual characteristics.",
    improvement: "Further investigation is recommended. Consult RNG documentation and consider specialized testing."
  }
};


export default function AnalysisResultCard({ apiResponse }: AnalysisResultCardProps) {
  const { predicted_class_name, probabilities, detail } = apiResponse;

  const predictedClassInfo = classDetails[predicted_class_name] || classDetails["Unknown Class"];
  const isVulnerable = predictedClassInfo.isVulnerable;
  
  // Get the probability of the predicted class
  const confidenceForPredictedClass = probabilities[predicted_class_name] !== undefined 
                                       ? probabilities[predicted_class_name] 
                                       : 0; // Fallback if class name not in probabilities
  const confidencePercentage = (confidenceForPredictedClass * 100).toFixed(2);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.headerBanner,
          isVulnerable ? styles.vulnerableBanner : styles.healthyBanner,
        ]}
      >
        {isVulnerable ? (
          <ShieldAlert size={24} color="#FFFFFF" />
        ) : (
          <ShieldCheck size={24} color="#FFFFFF" />
        )}
        <Text style={styles.bannerText}>
          {isVulnerable
            ? 'Potential Vulnerability Detected'
            : 'Analysis Complete: Healthy'}
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Predicted Status:</Text>
          <Text
            style={[
              styles.resultValue,
              isVulnerable ? styles.vulnerableText : styles.healthyText,
            ]}
          >
            {predictedClassInfo.displayName}
          </Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Confidence:</Text>
          <Text style={styles.resultValue}>{confidencePercentage}%</Text>
        </View>

        <View style={styles.confidenceBar}>
          <View
            style={[
              styles.confidenceFill,
              isVulnerable ? styles.vulnerableFill : styles.healthyFill,
              { width: `${Math.min(100, parseFloat(confidencePercentage))}%` },
            ]}
          />
        </View>
        
        <View style={styles.detailSection}>
          <Text style={styles.detailTitleSmall}>API Detail:</Text>
          <Text style={styles.detailTextSmall}>{detail}</Text>
        </View>

        {/* Displaying all probabilities - optional */}
        <View style={styles.divider} />
        <Text style={styles.detailTitle}>Full Probability Distribution:</Text>
        {Object.entries(probabilities)
            .sort(([,a],[,b]) => b-a) // Sort by probability descending
            .map(([className, prob]) => (
          <View key={className} style={styles.probabilityRow}>
            <Text style={styles.probabilityClassName}>{classDetails[className]?.displayName || className}:</Text>
            <Text style={styles.probabilityValue}>{(prob * 100).toFixed(4)}%</Text>
          </View>
        ))}


        {(predictedClassInfo.explanation || predictedClassInfo.improvement) && (
            <View style={styles.divider} />
        )}

        {isVulnerable && predictedClassInfo.explanation && (
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <AlertTriangle size={18} color="#DC2626" />
              <Text style={styles.detailTitle}>What We Found</Text>
            </View>
            <Text style={styles.detailText}>
              {predictedClassInfo.explanation}
            </Text>
          </View>
        )}

        {isVulnerable && predictedClassInfo.improvement && (
          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>Recommendations</Text>
            <Text style={styles.detailText}>
              {predictedClassInfo.improvement}
            </Text>
          </View>
        )}

        {!isVulnerable && predictedClassInfo.explanation && (
          <>
            <View style={styles.divider} />
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Your RNG Looks Good</Text>
              <Text style={styles.detailText}>
                {predictedClassInfo.explanation}
              </Text>
              {predictedClassInfo.improvement && (
                <Text style={styles.detailText}>
                  {predictedClassInfo.improvement}
                </Text>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  healthyBanner: {
    backgroundColor: '#10B981', // Green-500
  },
  vulnerableBanner: {
    backgroundColor: '#EF4444', // Red-500
  },
  bannerText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  contentContainer: {
    padding: 20,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 15, // Adjusted size
    color: '#475569', // Slate-600
  },
  resultValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 15, // Adjusted size
    color: '#0F172A', // Slate-900
  },
  healthyText: {
    color: '#059669', // Green-600
  },
  vulnerableText: {
    color: '#DC2626', // Red-600
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E2E8F0', // Slate-200
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthyFill: {
    backgroundColor: '#10B981', // Green-500
  },
  vulnerableFill: {
    backgroundColor: '#EF4444', // Red-500
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0', // Slate-200
    marginVertical: 16,
  },
  detailSection: {
    marginBottom: 12, // Adjusted margin
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B', // Slate-800
    marginLeft: 0, // No margin if icon is present, else 0
    marginBottom: 8,
  },
  detailTitleSmall: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#334155', // Slate-700
    marginBottom: 4,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#475569', // Slate-600
    lineHeight: 22,
    marginBottom: 8,
  },
  detailTextSmall: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#64748B', // Slate-500
    lineHeight: 20,
  },
  probabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  probabilityClassName: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#334155', // Slate-700
  },
  probabilityValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#1E293B', // Slate-800
  },
});