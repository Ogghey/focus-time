import {View, Text, StyleSheet} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { FocusContext } from '../context/FocusContext';
import { useContext } from 'react';

export default function ProgressScreen() {

    const { sessions } = useContext(FocusContext);

    if (!sessions || sessions.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Progress Fokus Kamu</Text>
                <Text style={styles.emptyState}>Tidak ada data fokus yang tersedia.</Text>
            </View>
        );
    }


    //totAL WAKTU
    const totalTime = sessions.reduce((acc,cur) => {
        return acc + cur.duration;
    }, 0);


    //FORMAT TIME
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    };

    const subjectTotals = {};
    sessions.forEach(s => {
        if (!subjectTotals[s.subject]) {
            subjectTotals[s.subject] = 0;
        }
        subjectTotals[s.subject] += s.duration;
    });


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Progress Fokus Kamu</Text>
                {Object.keys(subjectTotals).map((subject) => (
                    <View key={subject} style={styles.card}>
                        <Text style={styles.label}>{subject}</Text>
                        <Text style={styles.value}>{formatTime(subjectTotals[subject])}
                        </Text>
                    </View>
                ))}
        </View>

    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.md,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: spacing.lg,
        marginBottom: spacing.md,
        color: colors.textPrimary,
    },
    card: {
        backgroundColor: colors.card,
        padding: spacing.md,
        borderRadius: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: spacing.sm,
        color: colors.textSecondary,
    },
    value: {
        color: colors.textPrimary,
        fontSize: 20,
        fontWeight: 'bold',
    },
    emptyState: {
        fontSize: 16,
        color: colors.textSecondary,
    },

});