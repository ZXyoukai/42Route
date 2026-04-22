/**
 * Configuração de Ambiente - Carrega variáveis via react-native-dotenv
 * Este ficheiro é a fonte única de verdade para as variáveis de ambiente
 */

import { API_BASE_URL as ENV_API_BASE_URL } from '@env';

// Carregar do .env via @env (injetado pelo Babel em tempo de build)
export const ENV_CONFIG = {
  API_BASE_URL: ENV_API_BASE_URL || 'https://four2routeapi.onrender.com',
  API_TIMEOUT: 30000,
  DEBUG_MODE: true,
} as const;

// URL completa para API
export const API_FULL_URL = `${ENV_CONFIG.API_BASE_URL}/api`;
export const SOCKET_URL = ENV_CONFIG.API_BASE_URL;

// Log na inicialização
if (ENV_CONFIG.DEBUG_MODE) {
  console.log('[ENV_CONFIG] Configuração Carregada:');
  console.log('[ENV_CONFIG] API_BASE_URL:', ENV_CONFIG.API_BASE_URL);
  console.log('[ENV_CONFIG] API_FULL_URL:', API_FULL_URL);
  console.log('[ENV_CONFIG] SOCKET_URL:', SOCKET_URL);
}

export default ENV_CONFIG;
