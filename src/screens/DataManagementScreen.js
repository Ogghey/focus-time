import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated, PanResponder, BackHandler } from 'react-native';
import  React, { useState, useContext, useRef, useEffect, useCallback} from 'react';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Ionicons as Icon } from '@expo/vector-icons';
import { FocusContext } from '../context/FocusContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';
// Di DataManagementScreen.js, ubah tombol kembali
import { CommonActions, useFocusEffect } from '@react-navigation/native';

export default function DataManagementScreen({ navigation, route }) {
    const { sessions, subjects, saveSubjects, setSessions } = useContext(FocusContext);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [deleteType, setDeleteType] = useState(null);
    const [expandedCard, setExpandedCard] = useState(null);
    const swipeableRefs = useRef({});

    // Hitung statistik untuk setiap subject
    const getSubjectStats = (subjectId) => {
        const subjectSessions = sessions.filter(s => s.subjectId === subjectId);
        const totalDuration = subjectSessions.reduce((acc, s) => acc + s.duration, 0);
        const totalSessions = subjectSessions.length;
        
        return {
            totalDuration,
            totalSessions,
            lastSession: subjectSessions.length > 0 
                ? new Date(Math.max(...subjectSessions.map(s => s.startTime)))
                : null
        };
    };

    // Format waktu untuk display
    const formatDuration = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) {
            return `${hrs} jam ${mins} menit`;
        }
        return `${mins} menit`;
    };

    const formatDate = (date) => {
        if (!date) return 'Belum pernah';
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Hari ini';
        if (diffDays === 1) return 'Kemarin';
        return `${diffDays} hari lalu`;
    };

    // Hapus sessions berdasarkan subject
    const deleteSessionsBySubject = async (subjectId, subjectName) => {
        const remainingSessions = sessions.filter(s => s.subjectId !== subjectId);
        
        try {
            await AsyncStorage.setItem('sessions', JSON.stringify(remainingSessions));
            setSessions(remainingSessions);
            closeModal();
            showSuccessToast(`Semua sesi "${subjectName}" telah dihapus`);
        } catch (error) {
            console.error('Error deleting sessions:', error);
            showErrorToast('Gagal menghapus sesi fokus');
        }
    };

    // Hapus subject beserta sessions-nya
    const deleteSubjectAndSessions = async (subjectId, subjectName) => {
        const remainingSessions = sessions.filter(s => s.subjectId !== subjectId);
        const remainingSubjects = subjects.filter(s => s.id !== subjectId);
        
        try {
            await AsyncStorage.setItem('sessions', JSON.stringify(remainingSessions));
            await AsyncStorage.setItem('subjects', JSON.stringify(remainingSubjects));
            setSessions(remainingSessions);
            saveSubjects(remainingSubjects);
            closeModal();
            showSuccessToast(`"${subjectName}" dan ${sessions.filter(s => s.subjectId === subjectId).length} sesi telah dihapus`);
        } catch (error) {
            console.error('Error deleting subject and sessions:', error);
            showErrorToast('Gagal menghapus subject dan sesi');
        }
    };

    // Hapus semua data
    const deleteAllData = async () => {
        try {
            await AsyncStorage.setItem('sessions', JSON.stringify([]));
            await AsyncStorage.setItem('subjects', JSON.stringify([]));
            setSessions([]);
            saveSubjects([]);
            closeModal();
            showSuccessToast('Semua data telah dihapus');
            navigation.goBack();
        } catch (error) {
            console.error('Error deleting all data:', error);
            showErrorToast('Gagal menghapus semua data');
        }
    };

    // Toast notifikasi sederhana
    const [toast, setToast] = useState(null);
    const showSuccessToast = (message) => {
        setToast({ message, type: 'success' });
        setTimeout(() => setToast(null), 3000);
    };

    const showErrorToast = (message) => {
        setToast({ message, type: 'error' });
        setTimeout(() => setToast(null), 3000);
    };

    // Konfirmasi hapus
    const showConfirmDialog = (type, subject = null) => {
        setDeleteType(type);
        setSelectedSubject(subject);
        setConfirmModalVisible(true);
    };

    const closeModal = () => {
        setConfirmModalVisible(false);
        setSelectedSubject(null);
        setDeleteType(null);
    };

    const handleConfirmDelete = () => {
        if (deleteType === 'subject-sessions' && selectedSubject) {
            deleteSessionsBySubject(selectedSubject.id, selectedSubject.name);
        } else if (deleteType === 'subject-all' && selectedSubject) {
            deleteSubjectAndSessions(selectedSubject.id, selectedSubject.name);
        } else if (deleteType === 'all') {
            deleteAllData();
        }
    };


    // Handle tombol back fisik Android
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate('Settings');
                return true; // Mencegah aksi default (keluar app)
            };

            // Tambahkan event listener
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            // Cleanup: hapus listener saat screen tidak fokus
            return () => subscription.remove();
        }, [navigation])
    );

    // Fungsi untuk tombol back di header
    const handleBackPress = () => {
        navigation.navigate('Settings');
    };

    // Render right actions for swipeable
    const renderRightActions = (subject) => {
        const stats = getSubjectStats(subject.id);
        
        return (
            <View style={styles.swipeActions}>
                <TouchableOpacity
                    style={[styles.swipeButton, styles.swipeSessionsButton]}
                    onPress={() => showConfirmDialog('subject-sessions', subject)}
                    disabled={stats.totalSessions === 0}
                >
                    <Icon name="time-outline" size={20} color="#fff" />
                    <Text style={styles.swipeButtonText}>Hapus Sesi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.swipeButton, styles.swipeSubjectButton]}
                    onPress={() => showConfirmDialog('subject-all', subject)}
                >
                    <Icon name="trash" size={20} color="#fff" />
                    <Text style={styles.swipeButtonText}>Hapus Semua</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Subject Card Component
    const SubjectCard = ({ subject }) => {
        const stats = getSubjectStats(subject.id);
        const isExpanded = expandedCard === subject.id;
        
        return (
            <View style={styles.subjectCardWrapper}>
                <TouchableOpacity
                    style={styles.subjectCard}
                    onPress={() => setExpandedCard(isExpanded ? null : subject.id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.subjectCardHeader}>
                        <View style={styles.subjectInfo}>
                            <View style={[styles.subjectColorBadge, { backgroundColor: subject.color }]} />
                            <View>
                                <Text style={styles.subjectName}>{subject.name}</Text>
                                <View style={styles.subjectStats}>
                                    <View style={styles.statChip}>
                                        <Icon name="checkmark-circle" size={12} color={colors.textSecondary} />
                                        <Text style={styles.statChipText}>{stats.totalSessions} sesi</Text>
                                    </View>
                                    <View style={styles.statChip}>
                                        <Icon name="time" size={12} color={colors.textSecondary} />
                                        <Text style={styles.statChipText}>{formatDuration(stats.totalDuration)}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <Icon 
                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color={colors.textSecondary} 
                        />
                    </View>
                    
                    {isExpanded && (
                        <Animated.View style={styles.expandedContent}>
                            <View style={styles.divider} />
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Total Waktu Fokus</Text>
                                <Text style={styles.detailValue}>{formatDuration(stats.totalDuration)}</Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Jumlah Sesi</Text>
                                <Text style={styles.detailValue}>{stats.totalSessions} sesi</Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Terakhir Fokus</Text>
                                <Text style={styles.detailValue}>{formatDate(stats.lastSession)}</Text>
                            </View>
                            
                            <View style={styles.expandedActions}>
                                <TouchableOpacity
                                    style={[styles.expandedButton, styles.expandedSessionsButton]}
                                    onPress={() => showConfirmDialog('subject-sessions', subject)}
                                    disabled={stats.totalSessions === 0}
                                >
                                    <Icon name="time-outline" size={18} color={stats.totalSessions === 0 ? colors.textSecondary : colors.error} />
                                    <Text style={[styles.expandedButtonText, stats.totalSessions === 0 && styles.disabledText]}>
                                        Hapus Semua Sesi
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={[styles.expandedButton, styles.expandedAllButton]}
                                    onPress={() => showConfirmDialog('subject-all', subject)}
                                >
                                    <Icon name="trash" size={18} color="#fff" />
                                    <Text style={styles.expandedAllButtonText}>Hapus Subject & Sesi</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    // Total Stats
    const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
    const totalSubjects = subjects.length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kelola Data</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Summary Cards */}
            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: spacing.xxl }}
            >
                <View style={styles.summaryGrid}>
                    <View style={styles.summaryCard}>
                        <View style={[styles.summaryIcon, { backgroundColor: `${colors.primary}15` }]}>
                            <Icon name="book" size={24} color={colors.primary} />
                        </View>
                        <Text style={styles.summaryValue}>{totalSubjects}</Text>
                        <Text style={styles.summaryLabel}>Total Subject</Text>
                    </View>
                    
                    <View style={styles.summaryCard}>
                        <View style={[styles.summaryIcon, { backgroundColor: `${colors.success}15` }]}>
                            <Icon name="checkmark-circle" size={24} color={colors.success} />
                        </View>
                        <Text style={styles.summaryValue}>{sessions.length}</Text>
                        <Text style={styles.summaryLabel}>Total Sesi</Text>
                    </View>
                    
                    <View style={styles.summaryCard}>
                        <View style={[styles.summaryIcon, { backgroundColor: `${colors.warning}15` }]}>
                            <Icon name="hourglass" size={24} color={colors.warning} />
                        </View>
                        <Text style={styles.summaryValue}>{formatDuration(totalDuration)}</Text>
                        <Text style={styles.summaryLabel}>Total Waktu</Text>
                    </View>
                </View>

                {/* Subjects Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Hapus Berdasarkan Subject</Text>
                        <Text style={styles.sectionSubtitle}>
                            Ketuk card untuk melihat detail, atau geser ke kiri untuk aksi cepat
                        </Text>
                    </View>
                    
                    {subjects.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Icon name="folder-open-outline" size={48} color={colors.textSecondary} />
                            <Text style={styles.emptyStateText}>Belum ada subject yang dibuat</Text>
                        </View>
                    ) : (
                        subjects.map((subject) => (
                            <SubjectCard key={subject.id} subject={subject} />
                        ))
                    )}
                </View>

                {/* Delete All Section */}
                <View style={[styles.section, styles.dangerSection]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Hapus Semua Data</Text>
                        <Text style={styles.sectionSubtitle}>
                            Tindakan ini akan menghapus SEMUA subject dan riwayat sesi fokus
                        </Text>
                    </View>
                    
                    <TouchableOpacity
                        style={styles.deleteAllButton}
                        onPress={() => showConfirmDialog('all')}
                    >
                        <Icon name="warning" size={24} color="#fff" />
                        <View>
                            <Text style={styles.deleteAllTitle}>Hapus Semua Data</Text>
                            <Text style={styles.deleteAllSubtitle}>
                                {totalSubjects} subject, {sessions.length} sesi akan dihapus
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Toast Notification */}
            {toast && (
                <Animated.View style={[styles.toast, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
                    <Icon name={toast.type === 'success' ? 'checkmark-circle' : 'alert-circle'} size={20} color="#fff" />
                    <Text style={styles.toastText}>{toast.message}</Text>
                </Animated.View>
            )}

            {/* Modal Konfirmasi */}
            <Modal
                visible={confirmModalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={[styles.modalIcon, 
                            deleteType === 'all' && styles.modalIconDanger,
                            deleteType === 'subject-all' && styles.modalIconDanger,
                            deleteType === 'subject-sessions' && styles.modalIconWarning
                        ]}>
                            <Icon 
                                name={deleteType === 'all' ? "alert" : "trash"} 
                                size={48} 
                                color="#fff" 
                            />
                        </View>
                        
                        <Text style={styles.modalTitle}>
                            {deleteType === 'subject-sessions' && 'Hapus Semua Sesi?'}
                            {deleteType === 'subject-all' && 'Hapus Subject & Sesi?'}
                            {deleteType === 'all' && 'Hapus Semua Data?'}
                        </Text>
                        
                        <Text style={styles.modalMessage}>
                            {deleteType === 'subject-sessions' && `Anda yakin ingin menghapus semua sesi fokus untuk "${selectedSubject?.name}"?`}
                            {deleteType === 'subject-all' && `Anda yakin ingin menghapus subject "${selectedSubject?.name}" beserta ${sessions.filter(s => s.subjectId === selectedSubject?.id).length} sesi fokus?`}
                            {deleteType === 'all' && 'Anda yakin ingin menghapus SEMUA data fokus? Ini akan menghapus semua subject dan riwayat sesi.'}
                        </Text>
                        
                        <Text style={styles.modalWarning}>
                            Tindakan ini tidak dapat dibatalkan!
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={closeModal}
                            >
                                <Text style={styles.cancelButtonText}>Batal</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleConfirmDelete}
                            >
                                <Text style={styles.confirmButtonText}>Ya, Hapus</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: 60,
        paddingBottom: spacing.md,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.card,
    },
    backButton: {
        padding: spacing.sm,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: spacing.md,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 10,
        justifyContent: 'center',
        alignItems: 'center',
        color: colors.textSecondary,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 18,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    subjectCardWrapper: {
        marginBottom: spacing.md,
    },
    subjectCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    subjectCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    subjectInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    subjectColorBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    subjectName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    subjectStats: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    statChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statChipText: {
        fontSize: 11,
        color: colors.textSecondary,
    },
    expandedContent: {
        marginTop: spacing.md,
    },
    divider: {
        height: 1,
        backgroundColor: colors.background,
        marginBottom: spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.xs,
    },
    detailLabel: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    expandedActions: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    expandedButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        borderRadius: 12,
        borderWidth: 1,
    },
    expandedSessionsButton: {
        borderColor: colors.error,
        backgroundColor: 'transparent',
    },
    expandedAllButton: {
        backgroundColor: colors.error,
        borderColor: colors.error,
    },
    expandedButtonText: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.error,
    },
    expandedAllButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#fff',
    },
    disabledText: {
        color: colors.textSecondary,
    },
    swipeActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginLeft: spacing.sm,
    },
    swipeButton: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        borderRadius: 12,
        flexDirection: 'row',
        gap: spacing.xs,
    },
    swipeSessionsButton: {
        backgroundColor: colors.error,
    },
    swipeSubjectButton: {
        backgroundColor: '#FF4444',
    },
    swipeButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    dangerSection: {
        marginTop: spacing.sm,
    },
    deleteAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.error,
        padding: spacing.md,
        borderRadius: 16,
    },
    deleteAllTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    deleteAllSubtitle: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.8,
        marginTop: 2,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        backgroundColor: colors.card,
        borderRadius: 16,
    },
    emptyStateText: {
        marginTop: spacing.md,
        color: colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: spacing.xl,
        width: '85%',
        alignItems: 'center',
    },
    modalIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalIconWarning: {
        backgroundColor: colors.warning,
    },
    modalIconDanger: {
        backgroundColor: colors.error,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.md,
        lineHeight: 22,
    },
    modalWarning: {
        fontSize: 13,
        color: colors.error,
        textAlign: 'center',
        marginBottom: spacing.lg,
        fontWeight: '600',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.textSecondary,
    },
    confirmButton: {
        backgroundColor: colors.error,
    },
    cancelButtonText: {
        color: colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    toast: {
        position: 'absolute',
        bottom: 100,
        left: spacing.lg,
        right: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    toastSuccess: {
        backgroundColor: '#4CAF50',
    },
    toastError: {
        backgroundColor: colors.error,
    },
    toastText: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
    },
});