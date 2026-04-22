/**
 * Diagnóstico de Variáveis de Ambiente
 * Este ficheiro ajuda a diagnosticar problemas com o carregamento de variáveis
 */

import { ENV_CONFIG, API_FULL_URL, SOCKET_URL } from '../config/environment';

export function diagnosticEnvironment() {
  console.log('=== DIAGNÓSTICO DE VARIÁVEIS DE AMBIENTE ===');
  
  console.log('1. ENV_CONFIG.API_BASE_URL:', ENV_CONFIG.API_BASE_URL);
  console.log('2. Tipo:', typeof ENV_CONFIG.API_BASE_URL);
  console.log('3. API_FULL_URL:', API_FULL_URL);
  console.log('4. SOCKET_URL:', SOCKET_URL);
  
  // Verificações
  if (!ENV_CONFIG.API_BASE_URL) {
    console.warn('⚠️  AVISO: API_BASE_URL não foi configurada!');
  } else if (ENV_CONFIG.API_BASE_URL.includes('localhost') || ENV_CONFIG.API_BASE_URL.includes('127.0.0.1')) {
    console.log('✓ Backend local configurado:', ENV_CONFIG.API_BASE_URL);
  } else {
    console.log('✓ Backend remoto configurado:', ENV_CONFIG.API_BASE_URL);
  }
  
  console.log('=== FIM DO DIAGNÓSTICO ===\n');
  
  return ENV_CONFIG.API_BASE_URL;
}

export function getApiBaseUrl() {
  return ENV_CONFIG.API_BASE_URL;
}
