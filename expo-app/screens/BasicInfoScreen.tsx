import { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { Colors, Radius, Spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BasicInfo'>;

const frequencies = [
  { key: '1-2', label: '1-2 天' },
  { key: '3-4', label: '3-4 天' },
  { key: '5-6', label: '5-6 天' },
  { key: '7', label: '每天' },
] as const;

export default function BasicInfoScreen({ navigation }: Props) {
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [age, setAge] = useState('18');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('68');
  const [frequency, setFrequency] = useState<(typeof frequencies)[number]['key'] | null>(null);

  const canContinue = Boolean(gender && age && height && weight && frequency);

  const sanitizeDigits = useCallback((value: string, maxLength: number) => {
    return value.replace(/\D/g, '').slice(0, maxLength);
  }, []);

  return (
    <ScreenContainer>
      <SectionHeader title="基础信息" subtitle="补全你的身体基础数据，后续分析和计划会据此生成。" />

      <View style={styles.field}>
        <Text style={styles.label}>性别</Text>
        <View style={styles.genderRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setGender('male')}
            style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
          >
            <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>男</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setGender('female')}
            style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
          >
            <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>女</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>身体数据</Text>
        <View style={styles.dataRow}>
          <View style={styles.dataItem}>
            <TextInput
              style={styles.dataInput}
              value={age}
              onChangeText={(value) => setAge(sanitizeDigits(value, 3))}
              keyboardType="number-pad"
              placeholder="--"
              placeholderTextColor={Colors.textDim}
              maxLength={3}
            />
            <Text style={styles.dataUnit}>岁</Text>
          </View>
          <View style={styles.dataItem}>
            <TextInput
              style={styles.dataInput}
              value={height}
              onChangeText={(value) => setHeight(sanitizeDigits(value, 3))}
              keyboardType="number-pad"
              placeholder="--"
              placeholderTextColor={Colors.textDim}
              maxLength={3}
            />
            <Text style={styles.dataUnit}>cm</Text>
          </View>
          <View style={styles.dataItem}>
            <TextInput
              style={styles.dataInput}
              value={weight}
              onChangeText={(value) => setWeight(sanitizeDigits(value, 3))}
              keyboardType="number-pad"
              placeholder="--"
              placeholderTextColor={Colors.textDim}
              maxLength={3}
            />
            <Text style={styles.dataUnit}>kg</Text>
          </View>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>运动频率</Text>
        <View style={styles.freqRow}>
          {frequencies.map((item) => {
            const active = frequency === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.85}
                onPress={() => setFrequency(item.key)}
                style={[styles.freqBtn, active && styles.freqBtnActive]}
              >
                <Text style={[styles.freqText, active && styles.freqTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <PrimaryButton
        label="继续"
        disabled={!canContinue}
        onPress={() =>
          navigation.navigate('PhotoAssess', {
            basicInfo: {
              age: Number(age),
              height: Number(height),
              weight: Number(weight),
              gender: gender as 'male' | 'female',
            },
          })
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.inlineGap,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.cardGap,
  },
  genderBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnActive: {
    borderColor: Colors.ember,
    backgroundColor: Colors.emberLight,
  },
  genderText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  genderTextActive: {
    color: Colors.ember,
  },
  dataRow: {
    flexDirection: 'row',
    gap: Spacing.cardGap,
  },
  dataItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  dataInput: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    paddingVertical: 0,
    textAlign: 'center',
    width: '100%',
  },
  dataUnit: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  freqRow: {
    flexDirection: 'row',
    gap: Spacing.tightGap,
  },
  freqBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freqBtnActive: {
    borderColor: Colors.ember,
    backgroundColor: Colors.emberLight,
  },
  freqText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  freqTextActive: {
    color: Colors.ember,
  },
});
