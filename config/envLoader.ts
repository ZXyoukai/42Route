/**
 * Carregador de variáveis de ambiente alternativo
 * Independente do Babel - lê directamente o ficheiro .env em build-time
 */

import * as fs from 'fs';
import * as path from 'path';

// Função para carregar .env
function loadEnvFile(envPath: string): Record<string, string> {
  const env: Record<string, string> = {};
  
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=').trim();
          if (key && value) {
            env[key.trim()] = value
              .replace(/^["']|["']$/g, '') // Remove quotes
              .trim();
          }
        }
      });
    }
  } catch (err) {
    console.error('[ENV_LOADER] Erro ao ler .env:', err);
  }
  
  return env;
}

// Carregar variáveis
const projectRoot = __dirname; // Será resolvido em build-time
const envPath = path.join(projectRoot, '../../../.env');
const envVars = loadEnvFile(envPath);

console.log('[ENV_LOADER] Variáveis carregadas:', envVars);

export default envVars;
