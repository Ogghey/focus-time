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



    //render tiap item sesi fokus
    const renderItem = ({ item }) => (
    <>
        <Text style={styles.subject}>{item.subjectName}</Text>
        <Text style={styles.duration}>
        {formatDuration(item.duration)}
        </Text>
        <Text style={styles.time}>
        {formatTimeRange(item.startTime, item.endTime)}
        </Text>
    </>
    );

    //format hari
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

        return date.toDateString();
};

// Kelompokkan sesi berdasarkan tanggal
    const grupByDate = () => {
        const grouped = {};

        sessions.forEach(session => {
            const date = new Date(session.startTime)

            const key = date.toDateString();
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(session);
        });
        return grouped;
    };

    const groupedSessions = grupByDate();

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

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>

        {groupedArray.map((group) => (
          <View key={group.date}>

            <Text style={styles.dateHeader}>
              {formatDate(group.date)}
            </Text>

            {group.data.map((item) => (
              <View key={item.startTime} style={styles.card}>
                <Text style={styles.subject}>{item.subjectName}</Text>
                <Text style={styles.duration}>
                  {formatDuration(item.duration)}
                </Text>
                <Text style={styles.time}>
                  {formatTimeRange(item.startTime, item.endTime)}
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
    time: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: spacing.xs,
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

});