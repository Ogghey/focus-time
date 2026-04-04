import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { FocusContext } from '../context/FocusContext';
import { useContext, useState } from 'react';
import { formatTime } from '../utils/timeUtils';
import { StackedBarChart } from 'react-native-chart-kit';
import { Svg, Path, G, Text as SvgText } from 'react-native-svg';
import { useRef } from 'react';




export default function ProgressScreen() {

    const { sessions } = useContext(FocusContext);
    const  [filter, setFilter] = useState('week');
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
        //FORMAT TIME
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    };

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

    //StackedBarChart
    const subjects = [...new Set(sessions.map(s => s.subject))];

    let labels = [];
    if (filter === 'week') {
        labels = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    } else if (filter === 'month') {
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
    } else if (filter === 'year') {
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    }
    
    //struktur data untuk chart

    const data = labels.map(() =>
        subjects.map(() => 0)
    );

    //filter sesi berdasarkan rentang waktu
    filteredSessions.forEach(session => {

        const date = new Date(session.startTime);
        let Index; // posisi di sumbu x (labels) 
        if (filter === 'week') {
            Index = date.getDay(); // 0-6 (Minggu-Sabtu)
        } else if (filter === 'month') {
            Index = date.getDate() - 1; // 0-based index untuk tanggal
        } else if (filter === 'year') {
            Index = date.getMonth(); // 0-11 (Jan-Des)
        }

        const subjectIndex = subjects.indexOf(session.subject); // posisi di sumbu y (legend)
        if (Index !== undefined && subjectIndex !== -1) {
            data[Index][subjectIndex] += Math.floor(session.duration / 60); // konversi ke jam
        }
    });

    const chartWidth = Math.max(labels.length*50, screenWidth)

    

    // ubah string ke angka (hash)
    const stringToColor = (str) => {
        let hash = 0
        //loop tiap karakter
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#'

        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i*8)) & 255;

            color += ("00" + value.toString(16)).slice(-2);
        }
        return color
    }
    // Render Pie Chart manual dengan SVG
const renderPieChart = () => {
    const values = Object.values(subjectTotals);
    const totalValue = values.reduce((a, b) => a + b, 0);
    
    if (totalValue === 0) return null;
    
    let currentAngle = 0;
    const size = 320;
    const center = size / 2;
    const radius = 90;
    
    const slices = [];
    const labels = [];
    
    Object.keys(subjectTotals).forEach((subject, idx) => {
        const value = subjectTotals[subject];
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
            <Path key={subject} d={d} fill={stringToColor(subject)} stroke={colors.background} strokeWidth={2} />
        );
        
        const midAngle = startAngle + angle / 2;
        const midRad = (midAngle * Math.PI) / 180;
        
        // Titik di tepi pie
        const edgeX = center + radius * Math.cos(midRad);
        const edgeY = center + radius * Math.sin(midRad);
        
        // Titik di luar (untuk label)
        const labelRadius = radius + 30;
        const labelX = center + labelRadius * Math.cos(midRad);
        const labelY = center + labelRadius * Math.sin(midRad);
        
        // Garis penghubung
        const connector = `M ${edgeX} ${edgeY} L ${labelX} ${labelY}`;
        
        // Posisi anchor
        const isLeft = midAngle > 90 && midAngle < 270;
        const textX = labelX + (isLeft ? -5 : 5);
        const textAnchor = isLeft ? "end" : "start";
        
        labels.push(
            <G key={`label-${subject}`}>
                <Path d={connector} stroke={colors.textSecondary} strokeWidth={1} />
                <SvgText
                    x={textX}
                    y={labelY}
                    fill={colors.textPrimary}
                    fontSize="11"
                    textAnchor={textAnchor}
                    alignmentBaseline="middle"
                >
                    {subject}
                </SvgText>
            </G>
        );
        
        currentAngle += angle;
    });
    
    return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices}
            {labels}
        </Svg>
    );
};
    // Render legend untuk Pie Chart
    const renderPieLegend = () => {
        return Object.keys(subjectTotals).map((subject) => (
            <View key={subject} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: stringToColor(subject) }]} />
                <Text style={styles.legendText}>
                    {subject}: {formatTime(subjectTotals[subject])}
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

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingRight: 20}}>
                <StackedBarChart
                    data={{
                        labels: labels,
                        legend: [],
                        data,
                        barColors: subjects.map((subject, index) => stringToColor(subject)),
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
                 {Object.keys(subjectTotals).map((subject) => (
                <View key={subject} style={styles.card}>
                   <View style={styles.rowBetween}>
                    <View>
                    <Text style={styles.label}>{subject}</Text>
                    <Text style={styles.value}>{formatTime(subjectTotals[subject])}
                    </Text>
                    </View>
                    <View
                    style={{
                        width: 20, height: 20, backgroundColor: stringToColor(subject), borderRadius: 3
                    }}/>

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
    sectionContainer: {
        marginTop: spacing.lg,
        alignItems: 'center',
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    legendText: {
        color: colors.textPrimary,
        fontSize: 12,
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
    borderRadius: 12,
    width: '100%',
    minHeight: 350, // Tambahkan tinggi minimum
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