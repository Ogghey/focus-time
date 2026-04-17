import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Ionicons as Icon } from '@expo/vector-icons';


export default function SettingsScreen({ navigation }) {
    
    const menuItems = [
        {
            id: 'data-management',
            title: 'Kelola Data',
            description: 'Hapus sesi fokus berdasarkan subject atau hapus semua data',
            icon: 'trash-bin-outline',
            iconColor: '#FF6B6B',
            screen: 'DataManagementScreen',
            badge: null
        },
        {
            id: 'notifications',
            title: 'Notifikasi',
            description: 'Atur pengingat dan notifikasi fokus',
            icon: 'notifications-outline',
            iconColor: colors.primary,
            screen: null,
            badge: 'Coming Soon'
        },
        {
            id: 'theme',
            title: 'Tema',
            description: 'Sesuaikan tampilan aplikasi',
            icon: 'color-palette-outline',
            iconColor: '#4ECDC4',
            screen: null,
            badge: 'Coming Soon'
        },
        {
            id: 'sound',
            title: 'Suara',
            description: 'Atur suara timer dan notifikasi',
            icon: 'volume-high-outline',
            iconColor: '#F7B801',
            screen: null,
            badge: 'Coming Soon'
        },
        {
            id: 'backup',
            title: 'Backup & Restore',
            description: 'Cadangkan atau pulihkan data fokus',
            icon: 'cloud-outline',
            iconColor: '#6A0572',
            screen: null,
            badge: 'Coming Soon'
        },
        {
            id: 'about',
            title: 'Tentang Aplikasi',
            description: 'Versi, lisensi, dan informasi pengembang',
            icon: 'information-circle-outline',
            iconColor: colors.textSecondary,
            screen: null,
            badge: null
        },
    ];

    const renderMenuItem = (item) => {
        const isDisabled = item.screen === null;
        
        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.menuCard, isDisabled && styles.disabledCard]}
                // SettingsScreen.js - perbaiki bagian onPress
                // Di SettingsScreen.js, ubah navigasi ke DataManagementScreen
                // SettingsScreen.js - perbaiki onPress untuk DataManagementScreen
                onPress={() => {
                    if (item.screen) {
                        if (item.screen === 'DataManagementScreen') {
                            // Navigasi biasa ke Home stack
                            navigation.navigate('Home', { screen: 'DataManagementScreen' });
                        } else {
                            navigation.navigate(item.screen);
                        }
                    }
                }}
                activeOpacity={isDisabled ? 1 : 0.7}
            >
                <View style={styles.menuLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}15` }]}>
                        <Icon name={item.icon} size={24} color={item.iconColor} />
                    </View>
                    <View style={styles.menuTextContainer}>
                        <View style={styles.titleRow}>
                            <Text style={[styles.menuTitle, isDisabled && styles.disabledText]}>
                                {item.title}
                            </Text>
                            {item.badge && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{item.badge}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.menuDescription, isDisabled && styles.disabledText]}>
                            {item.description}
                        </Text>
                    </View>
                </View>
                {!isDisabled && (
                    <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Pengaturan</Text>
                <Text style={styles.headerSubtitle}>
                    Atur preferensi dan kelola data aplikasi
                </Text>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
                {menuItems.map(renderMenuItem)}
            </View>

            {/* Footer Info */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Focus Mode App</Text>
                <Text style={styles.footerVersion}>Version 1.0.0</Text>
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
        paddingHorizontal: spacing.lg,
        paddingTop: 60,
        paddingBottom: spacing.lg,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.card,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    menuContainer: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    menuCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card,
        padding: spacing.md,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    disabledCard: {
        opacity: 0.6,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuTextContainer: {
        flex: 1,
        gap: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    menuDescription: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    disabledText: {
        color: colors.textSecondary,
    },
    badge: {
        backgroundColor: `${colors.primary}20`,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 10,
        color: colors.primary,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        paddingBottom: spacing.xxl,
        marginBottom: spacing.lg,
    },
    footerText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    footerVersion: {
        fontSize: 12,
        color: colors.textSecondary,
        opacity: 0.6,
        
    },
});