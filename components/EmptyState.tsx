import { View, Text, StyleSheet } from 'react-native';
import { ReactNode } from 'react';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  message: string;
};

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
});