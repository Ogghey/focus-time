import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Pressable, TouchableWithoutFeedback
} from 'react-native';

import { useState, useContext, useEffect } from 'react';
import SubjectChip from '../components/SubjectChip';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Ionicons as Icon } from '@expo/vector-icons';
import { FocusContext } from '../context/FocusContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ColorPicker from 'react-native-wheel-color-picker';


export default function HomeScreen({ navigation }) {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const { sessions } = useContext(FocusContext);
  

  const { subjects, saveSubjects } = useContext(FocusContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [selectedColor, setSelectedColor] = useState("#7C5CFF");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [targetSubject, setTargetSubject] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState("#7C5CFF");
  const [activeSubject, setActiveSubject] = useState(null);
  const COLOR_OPTIONS = [
    "#7C5CFF",
    "#FF6B6B",
    "#4ECDC4",
    "#F7B801",
    "#6A0572",
    "#00917C"
  ];


  const saveSubject = () => {
    if (!newSubject.trim()) return;

    let updated;

    if (targetSubject) {
        updated = subjects.map((item) =>
            item.id === targetSubject.id
                ? { ...item, name: newSubject, color: selectedColor }
                : item
        );
    } else {
        updated = [
            ...subjects,
            {
                id: Date.now().toString(),
                name: newSubject,
                color: selectedColor
            }
        ];
    }

    saveSubjects(updated);

    // 🔥 ini fix modal
    setModalVisible(false);
    setNewSubject("");
    setSelectedColor("#7C5CFF");
};


  // Cek apakah subject sudah ada
  const isSubjectExists = (name, excludeId = null) => {
    return subjects.some(subject => 
      subject.name.toLowerCase() === name.toLowerCase() && 
      subject.id !== excludeId
    );
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    
    // Validasi subject ganda
    if (isSubjectExists(newSubject.trim())) {
      alert("Subject dengan nama tersebut sudah ada!");
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: newSubject.trim(),
      color: selectedColor,
    };

    const updated = [...subjects, newItem];
    saveSubjects(updated);

    setNewSubject("");
    setSelectedColor("#7C5CFF");
    setModalVisible(false);
  };

  const getTodayStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    const totalMinutes = todaySessions.reduce((total, session) => {
      return total + Math.floor(session.duration / 60);
    }, 0);

    return {
      totalMinutes,
      completedSessions: todaySessions.length
    };
  };

  const { totalMinutes, completedSessions } = getTodayStats();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 10) return 'Selamat Pagi';
    if (hour < 14) return 'Selamat Siang';
    if (hour < 17) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const isValid = newSubject.trim().length > 0;
  const isEditValid = editingName.trim().length > 0;

  const handleDeletePress = (subjectName) => {
    const subject = subjects.find(s => s.name === subjectName);
    setTargetSubject(subject);
    setActionType("delete");
    setActionModalVisible(true);
  };

  const handleEdit = (subject) => {
    setTargetSubject(subject);
    setActionType("edit");
    setEditingName(subject.name);
    setEditingColor(subject.color);
    setActionModalVisible(true);
  };

const deleteSubject = (id) => {
    const updated = subjects.filter(item => item.id !== id);
    saveSubjects(updated);

    if (selectedSubject === targetSubject.name) {
      setSelectedSubject(null);
    }

    setTargetSubject(null);
    setActiveSubject(null);
    closeModal();
  };

  const updateSubject = () => {
    if (!editingName.trim()) return;
    
    // Validasi subject ganda (kecuali untuk subject yang sama)
    if (isSubjectExists(editingName.trim(), targetSubject.id)) {
      alert("Subject dengan nama tersebut sudah ada!");
      return;
    }

    const updated = subjects.map(item => {
      if (item.id === targetSubject.id) {
        return {
          ...item,
          name: editingName.trim(),
          color: editingColor,
        };
      }
      return item;
    });
    
    saveSubjects(updated);
    
    if (selectedSubject === targetSubject.name) {
      setSelectedSubject(editingName.trim());
    }
    
    setActionModalVisible(false);
    setTargetSubject(null);
    setEditingName("");
    setEditingColor("#7C5CFF");
    setActiveSubject(null);
    closeModal();
  };

  const closeModal = () => {
    setActionModalVisible(false);
    setTargetSubject(null);
    setActionType(null);
    setEditingName("");
    setEditingColor("#7C5CFF");
    
  };

  return (
    <TouchableWithoutFeedback onPress={() => setActiveSubject(null)}>
  <View style={{ flex: 1 }}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.title}>Focus Mode</Text>
        </View>
        <View style={styles.profileIcon}>
          <Icon name="timer" size={40} color={colors.textPrimary} />
        </View>
      </View>

      {/* STATS CARD */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Statistik Harian</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="time-outline" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>Menit Fokus</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="checkmark-circle-outline" size={24} color={colors.success} />
            <Text style={styles.statValue}>{completedSessions}</Text>
            <Text style={styles.statLabel}>Sesi Selesai</Text>
          </View>
        </View>
      </View>

      {/* SUBJECT SECTION */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="book-outline" size={24} color={colors.primary} />
          <Text style={styles.cardTitle}>Pilih Subject</Text>
        </View>

        <View style={styles.subjectContainer}>
          {subjects.map((subject) => (
            <View key={subject.id} style={styles.subjectWrapper}>
                <SubjectChip
                  title={subject.name}
                  color={subject.color}
                  selected={selectedSubject === subject.name}
                  onPress={() => setSelectedSubject(subject.name)}
                  onLongPress={() => setActiveSubject(subject.name)} // 🔥 long press
                />
              {activeSubject === subject.name && (
              <View style={styles.actionContainer}>
                <TouchableOpacity 
                  onPress={() => handleEdit(subject)}
                  style={styles.actionButton}
                >
                  <Icon name="pencil" size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDeletePress(subject.name)}
                  style={styles.actionButton}
                >
                  <Icon name="trash" size={16} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={{ color: colors.primary }}>+ Tambah Subject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.startButton, !selectedSubject && styles.disabledButton]}
          disabled={!selectedSubject}
          
onPress={() => {
  const selected = subjects.find(s => s.name === selectedSubject);

  navigation.navigate("FocusScreen", {
    subject: selected
  });
}}
        >
          <Icon name="play-circle" size={24} color={colors.textPrimary} />
          <Text style={styles.startButtonText}>Mulai Fokus</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL TAMBAH SUBJECT */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.modalContainer} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Tambah Subject</Text>
            
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Nama subject"
                value={newSubject}
                onChangeText={setNewSubject}
                style={styles.inputFlex}
                placeholderTextColor="#9CA3AF"
              />
              <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
            </View>
            
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorBox,
                    {
                      backgroundColor: color,
                      borderWidth: selectedColor === color ? 3 : 0,
                      borderColor: "#fff"
                    }
                  ]}
                />
              ))}
              <TouchableOpacity 
                onPress={() => setShowColorPicker(true)}
                style={styles.customColorButton}
              >
                <Icon name="color-palette" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: isValid ? colors.primary : '#6366F1', opacity: isValid ? 1 : 0.5 }]} 
              disabled={!isValid} 
              onPress={addSubject}
            >
              <Text style={{ color: "#fff" }}>Simpan</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL EDIT SUBJECT */}
      <Modal visible={actionType === "edit"} transparent animationType="fade">
        <Pressable style={styles.modalContainer} onPress={closeModal}>
          <Pressable style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Edit Subject</Text>
            
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Nama subject"
                value={editingName}
                onChangeText={setEditingName}
                style={styles.inputFlex}
                placeholderTextColor="#9CA3AF"
              />
              <View style={[styles.colorPreview, { backgroundColor: editingColor }]} />
            </View>
            
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setEditingColor(color)}
                  style={[
                    styles.colorBox,
                    {
                      backgroundColor: color,
                      borderWidth: editingColor === color ? 3 : 0,
                      borderColor: "#fff"
                    }
                  ]}
                />
              ))}
              <TouchableOpacity 
                onPress={() => setShowColorPicker(true)}
                style={styles.customColorButton}
              >
                <Icon name="color-palette" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: isEditValid ? colors.primary : '#6366F1', opacity: isEditValid ? 1 : 0.5 }]} 
              disabled={!isEditValid} 
              onPress={updateSubject}
            >
              <Text style={{ color: "#fff" }}>Simpan Perubahan</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS */}
      <Modal visible={actionType === "delete"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Hapus Subject</Text>
            <Text style={styles.modalText}>
              Apakah Anda yakin ingin menghapus subject "{targetSubject?.name}"?
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => deleteSubject(targetSubject.id)}

              >
                <Text style={styles.modalButtonText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL COLOR PICKER */}
      <Modal visible={showColorPicker} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#0F1115" }}>
          <View style={styles.pickerHeader}>
            <Text style={styles.title}>Pilih Warna</Text>
            <TouchableOpacity onPress={() => setShowColorPicker(false)}>
              <Text style={{ color: "#7C5CFF" }}>Selesai</Text>
            </TouchableOpacity>
          </View>
          <ColorPicker
            onColorChangeComplete={(color) => {
              if (actionType === "edit") {
                setEditingColor(color.toString());
              } else {
                setSelectedColor(color.toString());
              }
            }}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
    </ScrollView>
      </View>
</TouchableWithoutFeedback>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.lg,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.lg,
    borderRadius: 24,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  subjectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  subjectWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  actionContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
  },
  actionButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  disabledButton: {
    opacity: 0.5,
  },
  startButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: colors.card,
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  inputFlex: {
    flex: 1,
    backgroundColor: colors.background,
    color: "#9CA3AF",
    padding: 12,
    borderRadius: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  colorRow: {
    flexDirection: "row",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 10,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  customColorButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#1A1D24",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: colors.card,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 20,
    width: "80%",
  },
  modalText: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: "#FF6B6B",
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
  },
});