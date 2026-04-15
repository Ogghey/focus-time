import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput, Pressable
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

  const [subjects, setSubjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [selectedColor, setSelectedColor] = useState("#7C5CFF");
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 🔥 pilihan warna (JANGAN pakai "colors" biar tidak bentrok)
  const COLOR_OPTIONS = [
    "#7C5CFF",
    "#FF6B6B",
    "#4ECDC4",
    "#F7B801",
    "#6A0572",
    "#00917C"
  ];

  // 🔥 load subject dari storage
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await AsyncStorage.getItem("subjects");

        if (data !== null) {
          setSubjects(JSON.parse(data)); // ✅ langsung set state
        }
      } catch (error) {
        console.error("Error loading subjects:", error);
      }
    };

    loadSubjects(); // 🔥 WAJIB dipanggil
  }, []);

  // 🔥 simpan subject
  const saveSubjects = async (updatedSubjects) => {
    setSubjects(updatedSubjects);
    await AsyncStorage.setItem("subjects", JSON.stringify(updatedSubjects));
  };

  // 🔥 tambah subject
  const addSubject = () => {
    if (!newSubject.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      name: newSubject,
      color: selectedColor,
    };

    const updated = [...subjects, newItem];

    saveSubjects(updated);

    setNewSubject("");
    setSelectedColor("#7C5CFF");
    setModalVisible(false);
  };

  // 🔥 statistik harian
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

  return (
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

      {/* STAT */}
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

      {/* SUBJECT */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="book-outline" size={24} color={colors.primary} />
          <Text style={styles.cardTitle}>Pilih Subject</Text>
        </View>

        <View style={styles.subjectContainer}>
          {subjects.map((subject) => (
            <SubjectChip
              key={subject.id}
              title={subject.name}
              color={subject.color}
              selected={selectedSubject === subject.name}
              onPress={() => setSelectedSubject(subject.name)}
            />
          ))}
        </View>

        {/* tambah subject */}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={{ color: colors.primary }}>
            + Tambah Subject
          </Text>
        </TouchableOpacity>

        {/* tombol start */}
        <TouchableOpacity
          style={[styles.startButton, !selectedSubject && styles.disabledButton]}
          disabled={!selectedSubject}
          onPress={() =>
            navigation.navigate("FocusScreen", {
              subject: selectedSubject
            })
          }
        >
          <Icon name="play-circle" size={24} color={colors.textPrimary} />
          <Text style={styles.startButtonText}>Mulai Fokus</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL */}
<Modal visible={modalVisible} transparent animationType="fade">

  {/* klik luar untuk close */}
  <Pressable
    style={styles.modalContainer}
    onPress={() => setModalVisible(false)}
  >

    {/* stop bubble supaya tidak ketutup */}
    <Pressable style={styles.modalContent}>

      <TouchableOpacity onPress={() => setModalVisible(false)}>
        <Icon name="close" size={30} color={colors.textSecondary} style={styles.closeText} />
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
                borderWidth: selectedColor === color ? 2 : 0,
                borderColor: "#fff"
              }
            ]}
          />
        ))}
        <TouchableOpacity onPress={() => setShowColorPicker(true)}
        style={styles.customColorButton}>
          <Icon name="color-palette" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
 
      </View>

      <TouchableOpacity style={[styles.button,
        {backgroundColor: isValid ? colors.primary : '#6366F1', opacity: isValid ? 1 : 0.5}]} disabled={!newSubject.trim()} onPress={addSubject}>
        <Text style={{ color: "#fff" }}>Simpan</Text>
      </TouchableOpacity>

    </Pressable>
  </Pressable>

</Modal>
<Modal visible={showColorPicker} animationType="slide">

  <View style={{ flex: 1, backgroundColor: "#0F1115" }}>

    {/* HEADER */}
    <View style={styles.pickerHeader}>
      <Text style={styles.title}>Pilih Warna</Text>

      <TouchableOpacity onPress={() => setShowColorPicker(false)}>
        <Text style={{ color: "#7C5CFF" }}>Selesai</Text>
      </TouchableOpacity>
    </View>

    {/* COLOR PICKER */}
    <ColorPicker
      onColorChange={(color) => {
        setSelectedColor(color.toString()); // simpan warna
      }}
      style={{ flex: 1 }}
    />

  </View>

</Modal>

    </ScrollView>
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
  addSubjectButton: {
  marginTop: 8,
  alignSelf: "flex-start"
},

modalTitle: {
  color: colors.textPrimary,
  fontSize: 18,
  fontWeight: "600",
  marginBottom: 12
},

modalContainer: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center"
},

modalContent: {
  backgroundColor: colors.card,
  margin: 20,
  padding: 20,
  borderRadius: 20
},

inputFlex: {
  flex: 1,
  backgroundColor: colors.background,
  color: colors.textPrimary,
  padding: 12,
  borderRadius: 10,
  marginBottom: 16
},

colorRow: {
  flexDirection: "row",
  marginBottom: 16
},

colorBox: {
  width: 32,
  height: 32,
  borderRadius: 8,
  marginRight: 10
},

button: {
  backgroundColor: colors.primary,
  padding: 12,
  borderRadius: 12,
  alignItems: "center"
},

closeText: {
  color: colors.textSecondary,
  fontSize: 16,
  alignSelf: "flex-end"
},
customColorButton: {
  width: 32,
  height: 32,
  borderRadius: 8,
  backgroundColor: "#1A1D24",
  justifyContent: "center",
  alignItems: "center"
},

pickerHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  padding: 16
},

inputRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  marginBottom: 16
},
colorPreview: {
  width: 32,
  height: 32,
  borderRadius: 8,
  marginLeft: 3,
  borderWidth: 1,
  borderColor: "#fff",
  marginBottom: 16
},


});