import { View, Text, StyleSheet, ScrollView } from "react-native";
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

    // Format hari
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }

        return date.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Kelompokkan sesi berdasarkan tanggal
    const groupByDate = () => {
        const grouped = {};
        
        // 🔥 Urutkan sessions dari yang terbaru ke terlama
        const sortedSessions = [...sessions].sort((a, b) => 
            new Date(b.startTime) - new Date(a.startTime)
        );

        sortedSessions.forEach(session => {
            const date = new Date(session.startTime);
            const key = date.toDateString();
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(session);
        });
        return grouped;
    };

    const groupedSessions = groupByDate();
    const groupedArray = Object.keys(groupedSessions).map(date => ({
        date,
        data: groupedSessions[date],
    }));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Riwayat Fokus</Text>

            {sessions.length === 0 ? (
                <Text style={styles.emptyText}>
                    Belum ada sesi fokus yang tercatat.
                </Text>
            ) : (
                <ScrollView 
                    contentContainerStyle={{ paddingBottom: spacing.xl }} 
                    showsVerticalScrollIndicator={false}
                >
                    {groupedArray.map((group) => (
                        <View key={group.date}>
                            <Text style={styles.dateHeader}>
                                {formatDate(group.date)}
                            </Text>

                            {group.data.map((session, index) => (
                                <View key={session.startTime + index} style={styles.card}>
                                    {/* 🔥 Langsung pakai subjectName dari session */}
                                    <View style={styles.subjectContainer}>
                                        <View 
                                            style={[
                                                styles.subjectColor, 
                                                { backgroundColor: session.subjectColor }
                                            ]} 
                                        />
                                        <Text style={styles.subject}>
                                            {session.subjectName || "Unknown Subject"}
                                        </Text>
                                    </View>
                                    
                                    <Text style={styles.duration}>
                                        {formatDuration(session.duration)}
                                    </Text>
                                    
                                    <Text style={styles.time}>
                                        {formatTimeRange(session.startTime, session.endTime)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </ScrollView>
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
    dateHeader: {
        color: colors.textSecondary,
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    card: {
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
    subjectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    subjectColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: spacing.sm,
    },
    subject: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
    },
    duration: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: spacing.xs,
    },
    time: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: spacing.xs,
    },
});