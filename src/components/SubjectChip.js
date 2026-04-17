import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function SubjectChip({title, selected, onPress, onLongPress, color}) {
    return (
        <TouchableOpacity 
        style={[
        styles.chip,
        selected && {
          backgroundColor: color, // 🔥 pakai warna
          borderColor: color
        }
      ]}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}>
            <Text style={[styles.text, selected && styles.selectedText]}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chip: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 40,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    selectedChip: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        transform: [{scale: 1.02}],
    },
    text: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    selectedText: {
        color: colors.textPrimary,
        fontWeight: '600',
    },
});