// Simples teste de carregamento de variáveis
const testEnvLoad = () => {
  try {
    const { API_BASE_URL } = require('@env');
    console.log('=== TESTE DE CARREGAMENTO ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('=====================');
    return API_BASE_URL;
  } catch (e) {
    console.error('Erro ao carregar @env:', e);
    return null;
  }
};

testEnvLoad();
