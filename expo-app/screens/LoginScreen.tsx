import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
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
  const [showTrainingModal, setShowTrainingModal] = useState(false);

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
      loginRef.current = setTimeout(() => setShowTrainingModal(true), 420);
    }, 900);
  }, [agreed, canLogin, code, navigation, phone, showToast, validateCode, validatePhone]);

  useEffect(() => () => {
    clearCountdown();
    if (sendCodeRef.current) clearTimeout(sendCodeRef.current);
    if (loginRef.current) clearTimeout(loginRef.current);
    if (toastRef.current) clearTimeout(toastRef.current);
  }, [clearCountdown]);

  const toastTranslateY = toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.glowTop} />
        <View style={styles.glowLeft} />
        <View style={styles.glowRight} />
      </View>

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
          <Ionicons name={toastIconMap[toast.tone]} size={16} color={Colors.emberButtonText} />
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
            <Text style={styles.brand}>HAND OF GOD</Text>
            <Text style={styles.tagline}>锻造身体 · 击杀弱点</Text>
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
                  selectionColor={Colors.ember}
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
                  selectionColor={Colors.ember}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSendCode}
                  disabled={!canSendCode}
                  style={[styles.codeBtn, !canSendCode && styles.codeBtnDisabled]}
                >
                  {sendingCode ? (
                    <ActivityIndicator size="small" color={Colors.emberButtonText} />
                  ) : (
                    <Text style={[styles.codeBtnText, !canSendCode && styles.codeBtnTextDisabled]}>
                      {countdown > 0 ? `${countdown}s` : '获取'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              {codeError ? <Text style={styles.errorHint}>{codeError}</Text> : null}
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={() => setAgreed(current => !current)} style={styles.agreeRow}>
              <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
                {agreed ? <Ionicons name="checkmark" size={11} color={Colors.emberButtonText} /> : null}
              </View>
              <Text style={styles.agreeText}>
                已阅读并同意 <Text style={styles.agreeLink}>用户协议</Text> 和 <Text style={styles.agreeLink}>隐私政策</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.92}
              onPress={handleLogin}
              disabled={!canLogin}
              style={[styles.loginBtn, !canLogin && styles.loginBtnDisabled]}
            >
              {loggingIn ? (
                <ActivityIndicator size="small" color={Colors.emberButtonText} />
              ) : (
                <Text style={styles.loginBtnText}>开始登录</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} onPress={() => showToast('注册暂未接入', 'info')}>
              <Text style={styles.footerLink}>还没有账号？立即注册</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showTrainingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>训练基础</Text>
            <Text style={styles.modalSub}>
              在开始之前，请告诉我们你的训练经验
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setShowTrainingModal(false);
                navigation.replace('BasicInfo', { hasTrainingBase: true });
              }}
              style={[styles.modalBtn, styles.modalBtnYes]}
            >
              <Text style={styles.modalBtnText}>有训练基础</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setShowTrainingModal(false);
                navigation.replace('BasicInfo', { hasTrainingBase: false });
              }}
              style={[styles.modalBtn, styles.modalBtnNo]}
            >
              <Text style={styles.modalBtnText}>无训练基础</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  glowTop: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: '5%',
    height: 220,
    borderRadius: 180,
    backgroundColor: Colors.emberGlow,
  },
  glowLeft: {
    position: 'absolute',
    left: '-10%',
    top: '18%',
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: Colors.emberMuted,
    opacity: 0.7,
  },
  glowRight: {
    position: 'absolute',
    right: '-8%',
    bottom: '14%',
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: Colors.emberLight,
    opacity: 0.8,
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
    backgroundColor: Colors.bgCardRaised,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
  },
  toast_success: {
    backgroundColor: Colors.bgCardRaised,
    borderWidth: 1,
    borderColor: 'rgba(46,168,74,0.20)',
  },
  toast_error: {
    backgroundColor: Colors.bgCardRaised,
    borderWidth: 1,
    borderColor: 'rgba(229,72,77,0.20)',
  },
  toastText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 40,
  },
  brand: {
    color: Colors.textPrimary,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: 0,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCardRaised,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  inputRowError: {
    borderColor: 'rgba(229,72,77,0.35)',
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
    backgroundColor: Colors.emberButton,
  },
  codeBtnDisabled: {
    opacity: 0.35,
  },
  codeBtnText: {
    color: Colors.emberButtonText,
    fontSize: 12,
    fontWeight: '800',
  },
  codeBtnTextDisabled: {
    color: Colors.textDim,
  },
  errorHint: {
    ...Typography.micro,
    color: Colors.error,
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
    borderColor: Colors.emberBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: Colors.emberButton,
    borderColor: Colors.emberButton,
  },
  agreeText: {
    ...Typography.caption,
    color: Colors.textMuted,
    flex: 1,
  },
  agreeLink: {
    color: Colors.ember,
  },
  loginBtn: {
    borderRadius: Radius.button,
    backgroundColor: Colors.emberButton,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  loginBtnDisabled: {
    opacity: 0.35,
  },
  loginBtnText: {
    color: Colors.emberButtonText,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerLink: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.bgOverlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '85%',
    maxWidth: 360,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.emberBorder,
    backgroundColor: Colors.bgCardRaised,
    padding: 24,
    gap: 14,
    alignItems: 'center',
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  modalSub: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalBtn: {
    width: '100%',
    minHeight: 48,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalBtnYes: {
    backgroundColor: Colors.emberButton,
    borderColor: Colors.emberButton,
  },
  modalBtnNo: {
    backgroundColor: Colors.bgCard,
    borderColor: Colors.emberBorder,
  },
  modalBtnText: {
    color: Colors.emberButtonText,
    fontSize: 15,
    fontWeight: '800',
  },
});
