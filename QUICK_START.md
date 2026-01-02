# 🚀 Guia de Início Rápido - API Integration

## Passo 1: Verificar Configuração

Certifique-se de que o arquivo `.env` está configurado corretamente:

```env
API_BASE_URL=https://four2routeapi.onrender.com/api
```

## Passo 2: Instalar Dependências

```bash
npm install
```

## Passo 3: Testar a Conexão com a API

Você pode testar a conexão usando os exemplos fornecidos:

```typescript
import { runAllTests } from './examples/apiExamples';

// Em um componente ou no console
runAllTests();
```

## Passo 4: Usar os Componentes Integrados

### Opção A: Substituir o App.tsx Original

Renomeie o arquivo atual e use o novo:

```bash
mv App.tsx App.old.tsx
mv AppWithAPI.tsx App.tsx
```

### Opção B: Integrar Gradualmente

Use os componentes novos lado a lado com os existentes:

```typescript
import { TransportDashboardAPI } from './components/TransportDashboardAPI';
import { TransportDashboard } from './components/TransportDashboard';

// Use TransportDashboardAPI quando conectado
// Use TransportDashboard como fallback
```

## Passo 5: Executar o App

```bash
npm start
```

## 📱 Testando em Diferentes Cenários

### Teste 1: Listar Rotas

```typescript
import { useRoutes } from './hooks/useRoutes';

function TestComponent() {
  const { routes, loading, error } = useRoutes();
  
  console.log('Rotas carregadas:', routes);
}
```

### Teste 2: Rastreamento GPS (Motorista)

```typescript
import { DriverProfileAPI } from './components/DriverProfileAPI';

<DriverProfileAPI 
  driverId={1}  // Substitua pelo ID real
  onBack={() => console.log('Voltar')}
/>
```

### Teste 3: Perfil do Estudante

```typescript
import { StudentProfileAPI } from './components/StudentProfileAPI';

<StudentProfileAPI 
  cadeteId={1}  // Substitua pelo ID real
  onBack={() => console.log('Voltar')}
  onLogout={() => console.log('Logout')}
/>
```

## 🔧 Resolução de Problemas

### Problema: "Network Error"

**Solução:**
1. Verifique se a API está online: `https://four2routeapi.onrender.com/api/routes`
2. Teste com Postman ou navegador
3. Verifique o firewall/proxy

### Problema: "Cannot read property 'id'"

**Solução:**
1. Verifique se os dados da API correspondem aos tipos TypeScript
2. Adicione verificações de null: `route?.id`
3. Use optional chaining: `route.stops?.length`

### Problema: GPS não funciona

**Solução:**
1. Teste em dispositivo físico (não emulador)
2. Verifique permissões no `app.json`
3. Ative localização no dispositivo

## 📊 Monitorando Requisições

Adicione logs no interceptor do Axios:

```typescript
// Em services/api.ts
api.interceptors.request.use((config) => {
  console.log('📤 Request:', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use((response) => {
  console.log('📥 Response:', response.status, response.config.url);
  return response;
});
```

## 🎯 Próximos Passos

1. **Implementar Autenticação**
   - Integrar OAuth 42
   - Armazenar tokens com AsyncStorage
   - Adicionar refresh token

2. **Adicionar Offline Support**
   - Cache com AsyncStorage
   - Queue de requisições pendentes
   - Sincronização ao reconectar

3. **Notificações Push**
   - Configurar Expo Notifications
   - Backend para enviar notificações
   - Alertas de chegada do autocarro

4. **WebSockets para Real-time**
   - Atualização de localização em tempo real
   - Chat entre motorista e cadetes
   - Status das rotas

## 📚 Recursos Adicionais

- [Documentação da API](./API_INTEGRATION.md)
- [Exemplos de Uso](./examples/apiExamples.ts)
- [Tipos TypeScript](./types/api.ts)
- [Documentação do Expo](https://docs.expo.dev/)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no console
2. Teste as requisições no Postman
3. Verifique a documentação da API
4. Entre em contato com a equipe de backend

---

**Boa sorte com o desenvolvimento! 🚀**
