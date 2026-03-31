import {View, Text, StyleSheet} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { FocusContext } from '../context/FocusContext';
import { useContext, useState } from 'react';
import { formatTime } from '../utils/timeUtils';




export default function ProgressScreen() {

    const { sessions } = useContext(FocusContext);
    const  [filter, setFilter] = useState('week');

    const filterSessions = () => {
        const now = new Date();
        return sessions.filter(session => {
            const date = new Date(session.startTime);
            if (filter === 'week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return date >= oneWeekAgo;
            } else if (filter === 'month') {
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            } else if (filter === 'year') {
                return date.getFullYear() === now.getFullYear();
            }
        });
    };
    
    const filteredSessions = filterSessions();



        

    if (!sessions || sessions.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Progress Fokus Kamu</Text>
                <Text style={styles.emptyState}>Tidak ada data fokus yang tersedia.</Text>
            </View>
        );
    }


    //totAL WAKTU
    const totalTime = filteredSessions.reduce((acc,cur) => {
        return acc + cur.duration;
    }, 0);



    //aggregasi (pengelompokan dan penjumlahan) waktu berdasarkan subject
    const subjectTotals = {};
    filteredSessions.forEach(s => {
        //jika subject belum ada di object, buat dengan nilai awal 0
        if (!subjectTotals[s.subject]) {
            subjectTotals[s.subject] = 0;
        }
        subjectTotals[s.subject] += s.duration;
    });




    return (
        <View style={styles.container}>
            <Text style={styles.title}>Progress Fokus Kamu</Text>
            {/* Tombol Filter */}
            <View style={styles.filterContainer}>
                {["week", "month", "year"].map((item) => (
                    <Text key={item} style={[styles.filterItem, filter === item && styles.activeFilter]} onPress={() => setFilter(item)}>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                ))}

            </View>
            {/* Total Waktu */}
            <View style={styles.card}>
                <Text style={styles.label}>Total Waktu Fokus</Text>
                <Text style={styles.value}>{formatTime(totalTime)}</Text>
            </View>

            {/* Total Waktu Per Subject */}
            <View>
                <Text style={styles.sectionTitle}>Total Waktu Per Subject</Text>
                 {Object.keys(subjectTotals).map((subject) => (
                <View key={subject} style={styles.card}>
                    <Text style={styles.label}>{subject}</Text>
                    <Text style={styles.value}>{formatTime(subjectTotals[subject])}
                    </Text>
                 </View>
                ))}
            </View>

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
        marginBottom: spacing.sm,
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
    filterContainer: {
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    filterItem: {
        backgroundColor: colors.card,
        padding: spacing.sm,
        borderRadius: 8,
        marginRight: spacing.sm,
        color: colors.textSecondary,
    },
    activeFilter: {
        backgroundColor: colors.primary,
        color: colors.textPrimary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: spacing.lg,
        marginBottom: spacing.md,
        color: colors.textPrimary,
    },

});