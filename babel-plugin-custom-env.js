/**
 * Plugin Babel customizado para garantir que .env é carregado correctamente
 */

const fs = require('fs');
const path = require('path');

module.exports = function customEnvPlugin() {
  return {
    visitor: {
      ImportDeclaration(nodePath) {
        const importPath = nodePath.node.source.value;
        
        // Se é uma importação de @env, force a releitura do ficheiro .env
        if (importPath === '@env') {
          console.log('[CUSTOM_PLUGIN] Detectada importação de @env, verificando .env...');
          
          const envFile = path.join(process.cwd(), '.env');
          if (fs.existsSync(envFile)) {
            const content = fs.readFileSync(envFile, 'utf-8');
            console.log('[CUSTOM_PLUGIN] Conteúdo de .env:');
            console.log(content);
          }
        }
      },
    },
  };
};
