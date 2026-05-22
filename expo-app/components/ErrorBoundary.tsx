import { Component, type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ScreenContainer from './ScreenContainer';
import { Colors } from '../theme';

type Props = {
  children: ReactNode;
  onRetry?: () => void;
};

type State = {
  hasError: boolean;
  errorMessage: string;
};

/**
 * 全局错误边界 — 捕获渲染异常，避免白屏
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ScreenContainer scroll={false}>
          <View style={styles.center}>
            <Text style={styles.icon}>⚠</Text>
            <Text style={styles.title}>出了点问题</Text>
            <Text style={styles.message}>{this.state.errorMessage}</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={this.handleRetry} style={styles.retryButton}>
              <Text style={styles.retryText}>重试</Text>
            </TouchableOpacity>
          </View>
        </ScreenContainer>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 80,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  message: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.goldLight,
    backgroundColor: Colors.goldButton,
  },
  retryText: {
    color: Colors.goldButtonText,
    fontSize: 13,
    fontWeight: '800',
  },
});
