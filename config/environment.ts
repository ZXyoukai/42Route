/**
 * Configuração de Ambiente - Alternativa ao react-native-dotenv
 * Este ficheiro é a fonte única de verdade para as variáveis de ambiente
 */


// MODIFICAR AQUI DIRETAMENTE SE NECESSÁRIO
export const ENV_CONFIG = {
  API_BASE_URL: process.env.API_BASE_URL,
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
