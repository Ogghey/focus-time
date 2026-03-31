import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { FocusContext } from "../context/FocusContext";
import { useContext } from "react";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export default function HistoryScreen() {
    const { sessions } = useContext(FocusContext);

    const formatDuration = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    const formatTimeRange = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        const format = (date) => 
        `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        return `${format(startDate)} - ${format(endDate)}`;
        

    };

    //render tiap item sesi fokus
        const renderItem = ({item}) => (
        <View style={styles.sessionCard}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
            <Text style={styles.timeRange}>{formatTimeRange(item.startTime, item.endTime)}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Riwayat Fokus</Text>
            {sessions.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada sesi fokus yang tercatat.</Text>
            ) : (
                <FlatList
                    data={sessions}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.startTime.toString()}
                />
            )}
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.lg,
        backgroundColor: colors.background,
    },
    title: {
        color: colors.textPrimary,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: spacing.lg,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
    sessionCard: {
        backgroundColor: colors.card,
        padding: spacing.lg,
        borderRadius: 16,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    subject: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    duration: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: spacing.xs,
    },
    timeRange: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: spacing.xs,
    },
});