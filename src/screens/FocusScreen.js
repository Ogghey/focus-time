import {View, Text, Button, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import useTimer from '../hooks/useTimer';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Ionicons as Icon } from '@expo/vector-icons';
import { FocusContext } from '../context/FocusContext';
import { useContext, useState } from 'react';

const {width} = Dimensions.get('window');

export default function FocusScreen({ route, navigation }) {
  const {subject} = route.params;
  const {seconds, isRunning, toggleTimer, startTime} = useTimer();

  const formatTime = () => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  const { addSession } = useContext(FocusContext);

  return (
    <View style={styles.container}>
      <View style={styles.timerCard}>
        <Text style={styles.subject}>{subject}</Text>
        <View style={styles.timerWrapper}>
          <Text style={styles.timer}>{formatTime()}</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, isRunning ? styles.pauseButton : styles.playButton]}
            onPress={toggleTimer}>
            <Icon 
              name={isRunning ? "pause" : "play"} 
              size={32} 
              color={colors.textPrimary} 
            />
            <Text style={styles.buttonText}>
              {isRunning ? "Pause" : "Mulai"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
           title='End Focus'
            style={styles.stopButton}
            onPress={() => {
              const endTime = Date.now();

              const duration = Math.floor((endTime - startTime) / 1000);
              const session = {
                subject,
                duration,
                startTime,
                endTime,
              }
              addSession(session);
              navigation.goBack()
            } }>
            <Icon name="stop" size={32} color={colors.textPrimary} />
            <Text style={styles.buttonText}>Berhenti</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },

  timerCard: {
    backgroundColor: colors.card,
    borderRadius: 32,
    padding: spacing.xl,
    width: width - 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  subject: {
    color: colors.textPrimary,
    fontSize: 18,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerWrapper: {
    marginVertical: spacing.lg,
    paddingVertical: spacing.xl,
  },
  timer: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 40,
    gap: spacing.sm,
  },
  playButton: {
    backgroundColor: colors.primary,
  },
  pauseButton: {
    backgroundColor: colors.warning,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 40,
    backgroundColor: colors.error,
    gap: spacing.sm,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});