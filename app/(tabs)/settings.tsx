import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
} from 'react-native';
import {
  Globe,
  Moon,
  Shield,
  Info,
  ChevronRight,
  HelpCircle,
} from 'lucide-react-native';
import Header from '@/components/Header';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [autoSaveResults, setAutoSaveResults] = useState(true);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const toggleDarkMode = () => setDarkMode((previousState) => !previousState);
  const toggleAutoSave = () =>
    setAutoSaveResults((previousState) => !previousState);
  const toggleTechnicalDetails = () =>
    setShowTechnicalDetails((previousState) => !previousState);

  const openWebsite = () => {
    Linking.openURL('https://model-jnth.onrender.com');
  };

  const openHelp = () => {
    // This would normally navigate to a help screen
    console.log('Open help');
  };

  const openAbout = () => {
    // This would normally navigate to an about screen
    console.log('Open about');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <Header title="Settings" /> */}

      <ScrollView style={styles.scrollView}>
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Moon size={20} color="#64748B" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={darkMode ? '#2563EB' : '#FFFFFF'}
            />
          </View>
        </View> */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analysis</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Shield size={20} color="#64748B" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>
                Auto-save results to history
              </Text>
            </View>
            <Switch
              value={autoSaveResults}
              onValueChange={toggleAutoSave}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={autoSaveResults ? '#2563EB' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Info size={20} color="#64748B" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Show technical details</Text>
            </View>
            <Switch
              value={showTechnicalDetails}
              onValueChange={toggleTechnicalDetails}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={showTechnicalDetails ? '#2563EB' : '#FFFFFF'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity style={styles.linkRow} onPress={openWebsite}>
            <View style={styles.settingContent}>
              <Globe size={20} color="#64748B" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>API Website</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={openHelp}>
            <View style={styles.settingContent}>
              <HelpCircle
                size={20}
                color="#64748B"
                style={styles.settingIcon}
              />
              <Text style={styles.settingLabel}>Help & Documentation</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={openAbout}>
            <View style={styles.settingContent}>
              <Info size={20} color="#64748B" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>About RNG Analyzer</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>RNG Analyzer v1.0.0</Text>
        </View>
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
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#334155',
  },
  versionContainer: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
  },
});
