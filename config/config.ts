/**
 * Configuração centralizada de variáveis de ambiente
 * Este ficheiro carrega as variáveis de forma confiável
 */

import { ENV_CONFIG } from './environment';

// Log para debugging
console.log('[CONFIG] Variáveis de ambiente:');
console.log('[CONFIG] API_BASE_URL:', ENV_CONFIG.API_BASE_URL);

// Re-exportar para compatibilidade
export const CONFIG = ENV_CONFIG;
export const API_BASE_URL = ENV_CONFIG.API_BASE_URL;

export default CONFIG;
