import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import { useState } from 'react';
import SubjectChip from '../components/SubjectChip';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Ionicons as Icon } from '@expo/vector-icons';
import { FocusContext } from '../context/FocusContext';

export default function HomeScreen({navigation, route}) {
  const subjects = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Fisika', 'Kimia', 'Biologi'];
  const [selectedSubject, setSelectedSubject] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 10) return 'Selamat Pagi';
    if (hour < 14) return 'Selamat Siang';
    if (hour < 17) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.title}>Focus Mode</Text>
        </View>
        <View style={styles.profileIcon}>
          <Icon name="timer" size={40} color={colors.textPrimary} />
        </View>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Statistik Harian</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="time-outline" size={24} color={colors.primary} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Menit Fokus</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="checkmark-circle-outline" size={24} color={colors.success} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Sesi Selesai</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="book-outline" size={24} color={colors.primary} />
          <Text style={styles.cardTitle}>Pilih Mata Pelajaran</Text>
        </View>

        <View style={styles.subjectContainer}>
          {subjects.map((subject) => (
            <SubjectChip
              key={subject}
              title={subject}
              selected={selectedSubject === subject}
              onPress={() => setSelectedSubject(subject)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.startButton, !selectedSubject && styles.disabledButton]}
          disabled={!selectedSubject}
          onPress={() =>
            navigation.navigate("FocusScreen", {
              subject: selectedSubject
            })
          }>
          <Icon name="play-circle" size={24} color={colors.textPrimary} />
          <Text style={styles.startButtonText}>Mulai Fokus</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.lg,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.lg,
    borderRadius: 24,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  subjectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  disabledButton: {
    opacity: 0.5,
  },
  startButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
});