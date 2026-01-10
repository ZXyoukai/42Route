import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';
import { authService } from 'services';


WebBrowser.maybeCompleteAuthSession();

interface LoginIntraProps {
  onback: () => void;
}

export default function LoginIntra({ onback }: LoginIntraProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const redirectUri = makeRedirectUri({
    scheme: '42routes',
    path: '/auth/42/callback'
  });

  const handleLogin = async () => {
    try {
      await authService.login42();
    } catch (err) {
      console.error('Erro ao abrir navegador:', err);
      setError('Erro ao tentar fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
      console.log('Processo de autenticação finalizado');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={60} color="#00babc" />
          </View>
          <Text style={styles.title}>Login com Intra 42</Text>
          <Text style={styles.subtitle}>
            Você será redirecionado para autenticar com suas credenciais da 42
          </Text>
        </View>

        {/* Erro */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Redirect URI info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>URL de Redirecionamento:</Text>
          <Text style={styles.infoText}>{redirectUri}</Text>
          <Text style={styles.infoSubtext}>
            Certifique-se de que esta URL está registrada no seu servidor
          </Text>
        </View>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="white" size="small" />
                <Text style={[styles.buttonText, styles.primaryButtonText]}>Abrindo navegador...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="log-in" size={24} color="white" />
                <Text style={[styles.buttonText, styles.primaryButtonText]}>Fazer Login com 42</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={onback}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="arrow-back" size={24} color="#00babc" />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Voltar</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    backgroundColor: 'rgba(0, 186, 188, 0.1)',
    borderRadius: 100,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
  },
  infoContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoTitle: {
    color: '#00babc',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  infoSubtext: {
    color: '#64748b',
    fontSize: 11,
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#00babc',
    shadowColor: '#00babc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#00babc',
  },
  buttonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: 'white',
  },
  secondaryButtonText: {
    color: '#00babc',
  },
});