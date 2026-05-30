import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PrimaryButton from '../components/PrimaryButton';
import { Colors, Radius, Spacing, Typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
type ToastTone = 'info' | 'success' | 'error';

type ToastState = {
  message: string;
  tone: ToastTone;
  visible: boolean;
};

const phonePattern = /^1\d{10}$/;
const codePattern = /^\d{6}$/;

const toastIconMap = {
  info: 'information-circle-outline',
  success: 'checkmark-circle-outline',
  error: 'alert-circle-outline',
} as const;

const valueCards = [
  { emoji: '🎮', label: '专属怪兽' },
  { emoji: '📊', label: 'AI 饮食计算' },
  { emoji: '⚔️', label: 'XP 升级' },
];

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [toast, setToast] = useState<ToastState>({ message: '', tone: 'info', visible: false });

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sendCodeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loginRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const isPhoneValid = useMemo(() => phonePattern.test(phone), [phone]);
  const isCodeValid = useMemo(() => codePattern.test(code), [code]);
  const canSendCode = isPhoneValid && countdown === 0 && !sendingCode && !loggingIn;
  const canLogin = isPhoneValid && isCodeValid && agreed && !sendingCode && !loggingIn;

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    Animated.timing(toastAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start(({ finished }) => {
      if (finished) {
        setToast(current => ({ ...current, visible: false }));
      }
    });
  }, [toastAnim]);

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ message, tone, visible: true });
    toastAnim.setValue(0);
    Animated.timing(toastAnim, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    toastRef.current = setTimeout(() => hideToast(), 2200);
  }, [hideToast, toastAnim]);

  const validatePhone = useCallback((value: string, force = false) => {
    if (!value) {
      setPhoneError(force ? '请输入手机号' : '');
      return false;
    }
    if (!phonePattern.test(value)) {
      setPhoneError('请输入 11 位手机号');
      return false;
    }
    setPhoneError('');
    return true;
  }, []);

  const validateCode = useCallback((value: string, force = false) => {
    if (!value) {
      setCodeError(force ? '请输入验证码' : '');
      return false;
    }
    if (!codePattern.test(value)) {
      setCodeError('请输入 6 位验证码');
      return false;
    }
    setCodeError('');
    return true;
  }, []);

  const sanitizeDigits = useCallback((value: string, max: number) => value.replace(/\D/g, '').slice(0, max), []);

  const startCountdown = useCallback(() => {
    clearCountdown();
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown(current => {
        if (current <= 1) {
          clearCountdown();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, [clearCountdown]);

  const handlePhoneChange = useCallback((value: string) => {
    const next = sanitizeDigits(value, 11);
    setPhone(next);
    if (phoneError && phonePattern.test(next)) setPhoneError('');
  }, [phoneError, sanitizeDigits]);

  const handleCodeChange = useCallback((value: string) => {
    const next = sanitizeDigits(value, 6);
    setCode(next);
    if (codeError && codePattern.test(next)) setCodeError('');
  }, [codeError, sanitizeDigits]);

  const handleSendCode = useCallback(() => {
    if (!validatePhone(phone, true)) {
      showToast('请先输入正确的手机号', 'error');
      return;
    }
    if (!canSendCode) return;

    setSendingCode(true);
    showToast('验证码发送中', 'info');

    if (sendCodeRef.current) clearTimeout(sendCodeRef.current);
    sendCodeRef.current = setTimeout(() => {
      setSendingCode(false);
      showToast('验证码已发送', 'success');
      startCountdown();
    }, 700);
  }, [canSendCode, phone, showToast, startCountdown, validatePhone]);

  const handleLogin = useCallback(() => {
    const phoneOk = validatePhone(phone, true);
    const codeOk = validateCode(code, true);
    if (!agreed) {
      showToast('请先勾选同意协议', 'error');
      return;
    }
    if (!phoneOk || !codeOk) {
      showToast('请先完善登录信息', 'error');
      return;
    }
    if (!canLogin) return;

    setLoggingIn(true);
    showToast('正在登录', 'info');

    if (loginRef.current) clearTimeout(loginRef.current);
    loginRef.current = setTimeout(() => {
      setLoggingIn(false);
      showToast('登录成功', 'success');
      loginRef.current = setTimeout(() => navigation.replace('BasicInfo'), 420);
    }, 900);
  }, [agreed, canLogin, code, phone, showToast, validateCode, validatePhone]);

  useEffect(() => () => {
    clearCountdown();
    if (sendCodeRef.current) clearTimeout(sendCodeRef.current);
    if (loginRef.current) clearTimeout(loginRef.current);
    if (toastRef.current) clearTimeout(toastRef.current);
  }, [clearCountdown]);

  const toastTranslateY = toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });

  return (
    <View style={styles.screen}>
      {toast.visible ? (
        <Animated.View
          style={[
            styles.toast,
            styles[`toast_${toast.tone}`],
            {
              top: insets.top + 10,
              opacity: toastAnim,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
        >
          <Ionicons name={toastIconMap[toast.tone]} size={16} color={Colors.bg} />
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      ) : null}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.brand3D}>HAND OF GOD</Text>
            <Text style={styles.tagline}>把赘肉打成经验值</Text>
          </View>

          <View style={styles.valueStrip}>
            {valueCards.map((item) => (
              <View key={item.label} style={styles.valueItem}>
                <Text style={styles.valueEmoji}>{item.emoji}</Text>
                <Text style={styles.valueLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <View style={[styles.inputRow, phoneError ? styles.inputRowError : null]}>
                <Text style={styles.prefix}>+86</Text>
                <TextInput
                  value={phone}
                  onChangeText={handlePhoneChange}
                  onBlur={() => validatePhone(phone, true)}
                  placeholder="手机号"
                  placeholderTextColor={Colors.textDim}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  maxLength={11}
                  style={styles.input}
                  selectionColor={Colors.accent}
                  returnKeyType="next"
                />
              </View>
              {phoneError ? <Text style={styles.errorHint}>{phoneError}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <View style={[styles.inputRow, codeError ? styles.inputRowError : null]}>
                <TextInput
                  value={code}
                  onChangeText={handleCodeChange}
                  onBlur={() => validateCode(code, true)}
                  placeholder="验证码"
                  placeholderTextColor={Colors.textDim}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  maxLength={6}
                  style={[styles.input, styles.codeInput]}
                  selectionColor={Colors.accent}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSendCode}
                  disabled={!canSendCode}
                  style={[styles.codeBtn, !canSendCode && styles.codeBtnDisabled]}
                >
                  {sendingCode ? (
                    <ActivityIndicator size="small" color={Colors.bg} />
                  ) : (
                    <Text style={[styles.codeBtnText, !canSendCode && styles.codeBtnTextDisabled]}>
                      {countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              {codeError ? <Text style={styles.errorHint}>{codeError}</Text> : null}
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={() => setAgreed(current => !current)} style={styles.agreeRow}>
              <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
                {agreed ? <Ionicons name="checkmark" size={11} color={Colors.bg} /> : null}
              </View>
              <Text style={styles.agreeText}>
                已阅读并同意 <Text style={styles.agreeLink}>用户协议</Text> 和 <Text style={styles.agreeLink}>隐私政策</Text>
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              label="开启锻造之旅"
              disabled={!canLogin}
              loading={loggingIn}
              onPress={handleLogin}
            />

            <TouchableOpacity activeOpacity={0.7} onPress={() => showToast('注册暂未接入', 'info')}>
              <Text style={styles.footerLink}>第一次来？创建战士档案</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPaddingH,
    paddingVertical: 32,
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    maxWidth: 420,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.button,
    zIndex: 100,
  },
  toast_info: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toast_success: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  toast_error: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  toastText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
  },
  brand3D: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: Colors.accent,
    textShadowColor: '#8A8678',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    color: Colors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  valueStrip: {
    flexDirection: 'row',
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    padding: 10,
    gap: 8,
    marginBottom: 24,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  valueItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  valueEmoji: {
    fontSize: 14,
  },
  valueLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: 20,
  },
  fieldGroup: {
    gap: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.input,
    borderWidth: 3,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  inputRowError: {
    borderColor: Colors.danger,
  },
  prefix: {
    color: Colors.textMuted,
    marginRight: 8,
    fontSize: 12,
    fontWeight: '800',
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: 0,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  codeInput: {
    flex: 3,
  },
  codeBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radius.button,
    backgroundColor: Colors.accent,
  },
  codeBtnDisabled: {
    opacity: 0.4,
  },
  codeBtnText: {
    color: Colors.bg,
    fontSize: 12,
    fontWeight: '800',
  },
  codeBtnTextDisabled: {
    color: Colors.textDim,
  },
  errorHint: {
    ...Typography.micro,
    color: Colors.danger,
    marginLeft: 2,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: Radius.checkbox,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  agreeText: {
    ...Typography.caption,
    color: Colors.textMuted,
    flex: 1,
  },
  agreeLink: {
    color: Colors.accent,
  },
  footerLink: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 4,
  },
});
