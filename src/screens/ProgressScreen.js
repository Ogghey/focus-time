import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { FocusContext } from '../context/FocusContext';
import { useContext, useState } from 'react';
import { StackedBarChart } from 'react-native-chart-kit';
import { Svg, Path, G, Text as SvgText, TSpan } from 'react-native-svg';

export default function ProgressScreen() {

    const { sessions, subjects: subjectList } = useContext(FocusContext);
    const [filter, setFilter] = useState('week');
    const screenWidth = Dimensions.get('window').width;

    const now = new Date();
    const filterSessions = () => {
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
            return true;
        });
    };
    
    const filteredSessions = filterSessions();

    // Format waktu
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!sessions || sessions.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Progress Fokus Kamu</Text>
                <Text style={styles.emptyState}>Tidak ada data fokus yang tersedia.</Text>
            </View>
        );
    }

    // Total waktu dari sesi yang difilter
    const totalTime = filteredSessions.reduce((acc, cur) => {
        return acc + cur.duration;
    }, 0);

    // 🔥 PERUBAHAN PENTING: Gunakan data dari session, bukan dari subjectList
    // Aggregasi waktu berdasarkan subject (pakai nama sebagai key)
    const subjectTotals = {};
    filteredSessions.forEach(session => {
        const subjectName = session.subjectName;
        if (!subjectTotals[subjectName]) {
            subjectTotals[subjectName] = {
                duration: 0,
                color: session.subjectColor,
                name: subjectName
            };
        }
        subjectTotals[subjectName].duration += session.duration;
    });

    // 🔥 StackedBarChart configuration
    let labels = [];
    let last7Days = [];

    if (filter === 'week') {
        const today = new Date();
        last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - (6 - i));
            return d;
        });
        labels = last7Days.map(d =>
            d.toLocaleDateString("id-ID", { weekday: "short" })
        );
    } else if (filter === 'month') {
        const daysInMonth = new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0
        ).getDate();
        labels = Array.from({ length: daysInMonth }, (_, i) =>
            (i + 1).toString()
        );
    } else if (filter === 'year') {
        labels = [
            'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
            'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
        ];
    }

    // 🔥 Ambil daftar subject dari subjectTotals (nama-nama subject)
    const subjects = Object.keys(subjectTotals);

    // 🔥 Siapkan data untuk chart
    const data = labels.map(() => subjects.map(() => 0));

    // Isi data chart dari sessions yang difilter
    filteredSessions.forEach(session => {
        const date = new Date(session.startTime);
        let index;

        if (filter === 'week') {
            index = last7Days.findIndex((d) =>
                d.toDateString() === date.toDateString()
            );
        } else if (filter === 'month') {
            index = date.getDate() - 1;
        } else if (filter === 'year') {
            index = date.getMonth();
        }

        const subjectIndex = subjects.indexOf(session.subjectName);

        if (index !== -1 && subjectIndex !== -1) {
            data[index][subjectIndex] += Math.floor(session.duration / 60);
        }
    });

    const chartWidth = Math.max(labels.length * 50, screenWidth);

    // 🔥 Render Pie Chart manual dengan SVG (sudah diperbaiki)
    const renderPieChart = () => {
        const subjectEntries = Object.entries(subjectTotals);
        const totalValue = subjectEntries.reduce((a, [, b]) => a + b.duration, 0);
        
        if (totalValue === 0) return null;
        
        let currentAngle = 10;
        const size = 335;
        const center = size / 2;
        const radius = 100;
        
        const slices = [];
        const labels_pie = [];
        
        subjectEntries.forEach(([subjectName, data]) => {
            const value = data.duration;
            const color = data.color;
            const angle = (value / totalValue) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            const x1 = center + radius * Math.cos(startRad);
            const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad);
            const y2 = center + radius * Math.sin(endRad);
            
            const largeArc = angle > 180 ? 1 : 0;
            
            const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            
            slices.push(
                <Path key={subjectName} d={d} fill={color} stroke={colors.background} strokeWidth={2} />
            );
            
            const midAngle = startAngle + angle / 2;
            const midRad = (midAngle * Math.PI) / 180;
            
            const edgeX = center + radius * Math.cos(midRad);
            const edgeY = center + radius * Math.sin(midRad);
            
            const labelRadius = radius + 10;
            const labelX = center + labelRadius * Math.cos(midRad);
            const labelY = center + labelRadius * Math.sin(midRad);
            
            const connector = `M ${edgeX} ${edgeY} L ${labelX} ${labelY}`;
            
            const isLeft = midAngle > 90 && midAngle < 270;
            const textX = labelX + (isLeft ? -5 : 5);
            const textAnchor = isLeft ? "end" : "start";
            
            labels_pie.push(
                <G key={`label-${subjectName}`}>
                    <Path d={connector} stroke={colors.textSecondary} strokeWidth={2} />
                    <SvgText
                        x={textX}
                        y={labelY}
                        fill={colors.textPrimary}
                        fontSize="11"
                        textAnchor={textAnchor}
                    >
                        {subjectName.split(" ").map((word, index) => (
                            <TSpan
                                key={index}
                                x={textX}
                                dy={index === 0 ? 0 : 12}
                            >
                                {word}
                            </TSpan>
                        ))}
                    </SvgText>
                </G>
            );
            
            currentAngle += angle;
        });
        
        return (
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {slices}
                {labels_pie}
            </Svg>
        );
    };

    // 🔥 Render legend untuk Pie Chart
    const renderPieLegend = () => {
        return Object.entries(subjectTotals).map(([subjectName, data]) => (
            <View key={subjectName} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: data.color }]} />
                <Text style={styles.legendText}>
                    {subjectName}: {formatTime(data.duration)}
                </Text>
            </View>
        ));
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 80}}>
            <Text style={styles.title}>Progress Fokus Kamu</Text>
            
            {/* Tombol Filter */}
            <View style={styles.filterContainer}>
                {["week", "month", "year"].map((item) => (
                    <Text 
                        key={item} 
                        style={[styles.filterItem, filter === item && styles.activeFilter]} 
                        onPress={() => setFilter(item)}
                    >
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                ))}
            </View>

            {/* Total Waktu */}
            <View style={styles.card}>
                <Text style={styles.label}>Total Waktu Fokus</Text>
                <Text style={styles.value}>{formatTime(totalTime)}</Text>
            </View>

            {/* Stacked Bar Chart */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingRight: 20}}>
                <StackedBarChart
                    data={{
                        labels: labels,
                        legend: subjects,
                        data: data,
                        barColors: subjects.map(subjectName => subjectTotals[subjectName].color),
                    }}
                    width={chartWidth}
                    height={220}
                    segments={5}
                    formatYLabel={(y) => `${parseInt(y)}m`}
                    fromZero
                    showValuesBar={false}
                    yAxisInterval={1}
                    hideLegend={true}
                    chartConfig={{
                        backgroundColor: colors.background,
                        backgroundGradientFrom: colors.background,
                        backgroundGradientTo: colors.background,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: () => colors.textSecondary,
                    }}
                    style={{
                        borderRadius: 16,
                        marginTop: 10,
                    }}
                />
            </ScrollView>

            {/* Total Waktu Per Subject */}
            <View>
                <Text style={styles.sectionTitle}>Total Waktu Per Subject</Text>
                {Object.entries(subjectTotals).map(([subjectName, data]) => (
                    <View key={subjectName} style={styles.card}>
                        <View style={styles.rowBetween}>
                            <View>
                                <Text style={styles.label}>{subjectName}</Text>
                                <Text style={styles.value}>{formatTime(data.duration)}</Text>
                            </View>
                            <View
                                style={{
                                    width: 20,
                                    height: 20,
                                    backgroundColor: data.color,
                                    borderRadius: 3
                                }}
                            />
                        </View>
                    </View>
                ))}
            </View>

            {/* Pie Chart Distribusi */}
            <View style={styles.pieSectionContainer}>
                <Text style={styles.sectionTitle}>Distribusi Waktu Fokus</Text>
                <View style={styles.pieChartContainer}>
                    {renderPieChart()}
                </View>
                <View style={styles.legendContainer}>
                    {renderPieLegend()}
                </View>
            </View>
        </ScrollView>
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
        textAlign: 'center',
        marginTop: spacing.xl,
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
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    pieSectionContainer: {
        marginTop: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    pieChartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: spacing.md,
        backgroundColor: colors.card,
        padding: spacing.md,
        borderRadius: 50,
        width: '100%',
        minHeight: 350,
    },
    legendContainer: {
        marginTop: spacing.sm,
        width: '100%',
        paddingHorizontal: spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
        backgroundColor: colors.card,
        padding: spacing.sm,
        borderRadius: 8,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 4,
        marginRight: 8,
    },
    legendText: {
        color: colors.textPrimary,
        fontSize: 14,
        flex: 1,
    },
});