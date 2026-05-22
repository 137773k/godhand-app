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

import { Colors, Typography, Radius, Spacing } from '../theme';
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
  const [toast, setToast] = useState<ToastState>({
    message: '',
    tone: 'info',
    visible: false,
  });

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
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  }, []);

  const hideToast = useCallback(() => {
    Animated.timing(toastAnim, { toValue: 0, duration: 160, useNativeDriver: true })
      .start(({ finished }) => { if (finished) setToast(c => ({ ...c, visible: false })); });
  }, [toastAnim]);

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ message, tone, visible: true });
    toastAnim.setValue(0);
    Animated.timing(toastAnim, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    toastRef.current = setTimeout(() => hideToast(), 2200);
  }, [hideToast, toastAnim]);

  const validatePhone = useCallback((value: string, force = false) => {
    if (!value) { setPhoneError(force ? '请输入手机号' : ''); return false; }
    if (!phonePattern.test(value)) { setPhoneError('请输入11位手机号'); return false; }
    setPhoneError(''); return true;
  }, []);

  const validateCode = useCallback((value: string, force = false) => {
    if (!value) { setCodeError(force ? '请输入验证码' : ''); return false; }
    if (!codePattern.test(value)) { setCodeError('请输入6位验证码'); return false; }
    setCodeError(''); return true;
  }, []);

  const sanitizeDigits = useCallback((v: string, max: number) => v.replace(/\D/g, '').slice(0, max), []);

  const startCountdown = useCallback(() => {
    clearCountdown(); setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearCountdown(); return 0; } return c - 1; });
    }, 1000);
  }, [clearCountdown]);

  const handlePhoneChange = useCallback((v: string) => {
    const next = sanitizeDigits(v, 11); setPhone(next);
    if (phoneError && phonePattern.test(next)) setPhoneError('');
  }, [phoneError, sanitizeDigits]);

  const handleCodeChange = useCallback((v: string) => {
    const next = sanitizeDigits(v, 6); setCode(next);
    if (codeError && codePattern.test(next)) setCodeError('');
  }, [codeError, sanitizeDigits]);

  const handleSendCode = useCallback(() => {
    if (!validatePhone(phone, true)) { showToast('请先输入正确的手机号', 'error'); return; }
    if (!canSendCode) return;
    setSendingCode(true); showToast('验证码发送中', 'info');
    if (sendCodeRef.current) clearTimeout(sendCodeRef.current);
    sendCodeRef.current = setTimeout(() => {
      setSendingCode(false); showToast('验证码已发送', 'success'); startCountdown();
    }, 700);
  }, [canSendCode, phone, showToast, startCountdown, validatePhone]);

  const handleLogin = useCallback(() => {
    const phoneOk = validatePhone(phone, true);
    const codeOk = validateCode(code, true);
    if (!agreed) { showToast('请先勾选同意协议', 'error'); return; }
    if (!phoneOk || !codeOk) { showToast('请先完善登录信息', 'error'); return; }
    if (!canLogin) return;
    setLoggingIn(true); showToast('正在登录', 'info');
    if (loginRef.current) clearTimeout(loginRef.current);
    loginRef.current = setTimeout(() => {
      setLoggingIn(false); showToast('登录成功', 'success');
      loginRef.current = setTimeout(() => navigation.replace('BasicInfo'), 420);
    }, 900);
  }, [agreed, canLogin, code, navigation, phone, showToast, validateCode, validatePhone]);

  useEffect(() => () => {
    clearCountdown();
    if (sendCodeRef.current) clearTimeout(sendCodeRef.current);
    if (loginRef.current) clearTimeout(loginRef.current);
    if (toastRef.current) clearTimeout(toastRef.current);
  }, [clearCountdown]);

  // ── Web 端：强制注入宋体 CSS（React Native Web 对 fontFamily 支持有限）──
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const style = document.createElement('style');
    style.textContent = `
      #brand-tagline, #brand-tagline * {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
        font-size: 15px !important;
        font-weight: 700 !important;
        letter-spacing: 0.06em !important;
        line-height: 1.5 !important;
        color: rgba(242,236,228,0.78) !important;
        text-align: center !important;
        -webkit-font-smoothing: antialiased;
      }
    `;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  const toastTranslateY = toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });

  return (
    <View style={styles.screen}>
      {/* ── 氛围光晕（比v3更克制，若有若无）── */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.glowTop} />
        <View style={styles.glowLeft} />
        <View style={styles.glowRight} />
      </View>

      {/* ── Toast ── */}
      {toast.visible ? (
        <Animated.View style={[
          styles.toast,
          styles[`toast_${toast.tone}`],
          { top: insets.top + 10, opacity: toastAnim, transform: [{ translateY: toastTranslateY }] },
        ]}>
          <Ionicons name={toastIconMap[toast.tone]} size={16} color={Colors.textPrimary} />
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      ) : null}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ═══ 标题区 — FORGE：粗体压阵、无装饰 ═══ */}
          <View style={styles.header}>
            <Text style={styles.brand}>HAND OF GOD</Text>
            <Text nativeID="brand-tagline" style={styles.tagline}>
              把未来拖到掌心里
            </Text>
          </View>

          {/* ═══ 表单区 — v8 去框化：雾中刻字、空间呼吸 ═══ */}
          <View style={styles.form}>

            {/* 手机号 */}
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
                  selectionColor={Colors.gold}
                  returnKeyType="next"
                />
              </View>
              {phoneError ? <Text style={styles.errorHint}>{phoneError}</Text> : null}
            </View>

            {/* 验证码 */}
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
                  selectionColor={Colors.gold}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSendCode}
                  disabled={!canSendCode}
                  style={[styles.codeBtn, !canSendCode && styles.codeBtnDisabled]}
                >
                  {sendingCode ? (
                    <ActivityIndicator size="small" color={Colors.gold} />
                  ) : (
                    <Text style={[styles.codeBtnText, !canSendCode && styles.codeBtnTextDisabled]}>
                      {countdown > 0 ? `${countdown}s` : '获取'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              {codeError ? <Text style={styles.errorHint}>{codeError}</Text> : null}
            </View>

            {/* 协议 */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAgreed(c => !c)}
              style={styles.agreeRow}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
                {agreed ? <Ionicons name="checkmark" size={11} color={Colors.goldButtonText} /> : null}
              </View>
              <Text style={styles.agreeText}>
                已阅读并同意 <Text style={styles.agreeLink}>用户协议</Text> 和 <Text style={styles.agreeLink}>隐私政策</Text>
              </Text>
            </TouchableOpacity>

            {/* 登录按钮 — Revolut式全圆角药丸 */}
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={handleLogin}
              disabled={!canLogin}
              style={[styles.loginBtn, !canLogin && styles.loginBtnDisabled]}
            >
              {loggingIn ? (
                <ActivityIndicator size="small" color={Colors.goldButtonText} />
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
    </View>
  );
}

// ═══════════════════════════════════════════
// 样式 — 暗金精工 v7 · 品牌徽标 + 毛玻璃卡片
// ═══════════════════════════════════════════
const styles = StyleSheet.create({
  flex: { flex: 1 },
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

  // ── 氛围光晕（FORGE：余烬火光）──
  glowTop: {
    position: 'absolute',
    left: '5%', right: '5%', top: '3%',
    height: 200, borderRadius: 160,
    backgroundColor: 'rgba(224,97,58,0.05)',
  },
  glowLeft: {
    position: 'absolute',
    left: '-10%', top: '10%',
    width: 140, height: 140, borderRadius: 140,
    backgroundColor: 'rgba(224,97,58,0.10)',
    opacity: 0.6,
  },
  glowRight: {
    position: 'absolute',
    right: '-8%', bottom: '15%',
    width: 120, height: 120, borderRadius: 120,
    backgroundColor: 'rgba(224,97,58,0.08)',
    opacity: 0.5,
  },

  // ── Toast ──
  toast: {
    position: 'absolute', left: 16, right: 16, maxWidth: 420,
    alignSelf: 'center', flexDirection: 'row', alignItems: 'center',
    gap: 8, paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: Radius.button, zIndex: 100,
  },
  toast_info:    { backgroundColor: Colors.bgCardRaised, borderWidth: 1, borderColor: Colors.emberBorder },
  toast_success: { backgroundColor: Colors.bgCardRaised, borderWidth: 1, borderColor: 'rgba(46,168,74,0.20)' },
  toast_error:   { backgroundColor: Colors.bgCardRaised, borderWidth: 1, borderColor: 'rgba(229,72,77,0.20)' },
  toastText: {
    ...Typography.caption, color: Colors.textPrimary, flex: 1,
  },

  // ── 标题区 — v8 空间呼吸 ──
  header: {
    alignItems: 'center', gap: 6, marginBottom: 40,
  },
  // 钻石几何徽标
  emblem: {
    width: 36, height: 24, marginBottom: 12,
    alignItems: 'center',
  },
  emblemTop: {
    width: 0, height: 0,
    borderLeftWidth: 12, borderRightWidth: 12,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: Colors.gold,
    opacity: 0.7,
    marginBottom: -1,
  },
  emblemBottom: {
    width: 0, height: 0,
    borderLeftWidth: 12, borderRightWidth: 12,
    borderTopWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: Colors.gold,
    opacity: 0.35,
  },
  // 装饰线 + 标题
  kickerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  kickerLine: {
    flex: 1, height: 0.5,
    backgroundColor: Colors.gold,
    opacity: 0.25,
  },
  kicker: {
    ...Typography.micro, color: Colors.gold, letterSpacing: 3,
  },
  brand: {
    fontSize: 36, fontWeight: '600' as const, lineHeight: 40,
    color: Colors.textPrimary, letterSpacing: -1.2,
    marginTop: 8,
  },
  divider: {
    width: 32, height: 1,
    backgroundColor: Colors.gold,
    opacity: 0.4,
    borderRadius: 1,
    marginVertical: 10,
  },
  tagline: {
    fontFamily: "'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif",
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 28,
    color: 'rgba(245,240,230,0.52)',
    textAlign: 'center',
    letterSpacing: 3,
    maxWidth: 300,
    marginTop: 6,
  },

  // ── 表单 — v8 去框化：无容器、雾中刻字 ──
  form: {
    width: '100%', maxWidth: 400, alignSelf: 'center', gap: 20,
  },

  fieldGroup: { gap: 4 },

  // 输入行 — v8 雾中刻字：极微底色、若有若无边界
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10,
    borderWidth: 0.5, borderColor: 'rgba(245,240,230,0.06)',
    backgroundColor: 'rgba(245,240,230,0.025)',
    paddingHorizontal: 16, minHeight: 52,
  },
  inputRowError: {
    borderColor: 'rgba(229,72,77,0.35)',
  },
  prefix: {
    ...Typography.caption, color: Colors.textMuted, marginRight: 8,
    fontWeight: '600' as const,
  },
  input: {
    flex: 1, ...Typography.body, color: Colors.textPrimary,
    paddingVertical: 0, fontSize: 16, letterSpacing: 0.2,
  },
  codeInput: { flex: 3 },
  codeBtn: {
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: Radius.pill,
    backgroundColor: Colors.goldMuted,
  },
  codeBtnDisabled: { opacity: 0.35 },
  codeBtnText: {
    ...Typography.caption, color: Colors.gold, fontWeight: '600' as const,
  },
  codeBtnTextDisabled: { color: Colors.textDim },
  errorHint: {
    ...Typography.micro, color: Colors.error, marginLeft: 2,
  },

  // 协议
  agreeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 4,
  },
  checkbox: {
    width: 18, height: 18, borderRadius: Radius.checkbox,
    borderWidth: 1, borderColor: Colors.goldBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: Colors.goldButton, borderColor: Colors.goldButton,
  },
  agreeText: {
    ...Typography.caption, color: Colors.textMuted, flex: 1,
  },
  agreeLink: {
    color: Colors.gold,
  },

  // 登录按钮 — 9999px 全圆角药丸
  loginBtn: {
    minHeight: 52, borderRadius: Radius.button,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.goldButton,
  },
  loginBtnDisabled: { opacity: 0.38 },
  loginBtnText: {
    fontSize: 16, fontWeight: '600' as const,
    color: Colors.goldButtonText, letterSpacing: 0.5,
  },

  footerLink: {
    ...Typography.caption, color: Colors.textMuted, textAlign: 'center',
    paddingTop: 8,
  },
});
