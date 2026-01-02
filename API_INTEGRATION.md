# 42Route - Integração da API

Este documento descreve a integração da aplicação mobile 42Route com a API Backend.

## 📋 Índice

- [Configuração](#configuração)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Serviços Disponíveis](#serviços-disponíveis)
- [Hooks Personalizados](#hooks-personalizados)
- [Componentes Integrados](#componentes-integrados)
- [Uso](#uso)

## ⚙️ Configuração

### API Base URL

A URL base da API está configurada no arquivo `.env`:

```env
API_BASE_URL=https://four2routeapi.onrender.com/api
```

### Instalação

Todas as dependências necessárias já estão instaladas:

```bash
npm install
```

Principais dependências adicionadas:
- `axios` - Cliente HTTP para requisições à API

## 📁 Estrutura do Projeto

```
42Route/
├── types/
│   └── api.ts                    # Tipos TypeScript da API
├── services/
│   ├── api.ts                    # Configuração do Axios
│   ├── adminService.ts           # Serviço de Administradores
│   ├── cadeteService.ts          # Serviço de Cadetes
│   ├── driverService.ts          # Serviço de Motoristas
│   ├── routeService.ts           # Serviço de Rotas
│   ├── miniBusStopService.ts    # Serviço de Paragens
│   ├── authService.ts            # Serviço de Autenticação
│   └── index.ts                  # Exportações
├── hooks/
│   ├── useAdmins.ts             # Hook para Administradores
│   ├── useCadetes.ts            # Hook para Cadetes
│   ├── useDrivers.ts            # Hook para Motoristas
│   ├── useRoutes.ts             # Hook para Rotas
│   ├── useMiniBusStops.ts       # Hook para Paragens
│   └── index.ts                 # Exportações
└── components/
    ├── TransportDashboardAPI.tsx # Dashboard integrado
    ├── DriverProfileAPI.tsx      # Perfil do Motorista integrado
    ├── StudentProfileAPI.tsx     # Perfil do Estudante integrado
    └── RouteDetailAPI.tsx        # Detalhes da Rota integrados
```

## 🔌 Serviços Disponíveis

### AdminService

```typescript
import { adminService } from './services';

// Listar todos os administradores
const admins = await adminService.getAll();

// Buscar por ID
const admin = await adminService.getById(1);

// Criar novo administrador
const newAdmin = await adminService.create({
  name: "João Silva",
  email: "joao@42luanda.ao",
  phone: "+244923456789"
});

// Atualizar administrador
const updated = await adminService.update(1, {
  name: "João Silva Atualizado"
});

// Eliminar administrador
await adminService.delete(1);
```

### CadeteService

```typescript
import { cadeteService } from './services';

// Listar todos os cadetes
const cadetes = await cadeteService.getAll();

// Buscar por ID
const cadete = await cadeteService.getById(1);

// Criar novo cadete
const newCadete = await cadeteService.create({
  name: "Maria Santos",
  email: "maria@42luanda.ao",
  phone: "+244923456789"
});

// Obter informações da rota do cadete
const routeInfo = await cadeteService.getRouteInformations(1);
```

### DriverService

```typescript
import { driverService } from './services';

// Listar todos os motoristas
const drivers = await driverService.getAll();

// Buscar por ID
const driver = await driverService.getById(1);

// Atualizar localização do motorista
await driverService.updateLocation(1, {
  lat: -8.8383,
  long: 13.2344
});

// Atribuir rota ao motorista
await driverService.assignRoute(1, { route_id: 2 });

// Remover motorista da rota
await driverService.leaveRoute(1);
```

### RouteService

```typescript
import { routeService } from './services';

// Listar todas as rotas
const routes = await routeService.getAll();

// Buscar rota por ID
const route = await routeService.getById(1);

// Criar nova rota
const newRoute = await routeService.create({
  route_name: "Rota Central",
  description: "Rota principal do campus"
});

// Adicionar paragem à rota
await routeService.addStop(1, {
  stop_name: "Campus 42",
  latitude: -8.8383,
  longitude: 13.2344
});
```

### MiniBusStopService

```typescript
import { miniBusStopService } from './services';

// Listar todas as paragens
const stops = await miniBusStopService.getAll();

// Buscar paragem por ID
const stop = await miniBusStopService.getById(1);

// Criar nova paragem
const newStop = await miniBusStopService.create({
  stop_name: "Estação Central",
  distrit: "Maianga",
  latitude: -8.8383,
  longitude: 13.2344
});
```

## 🎣 Hooks Personalizados

### useRoutes

```typescript
import { useRoutes } from './hooks';

function MyComponent() {
  const { routes, loading, error, fetchRoutes, getRouteById } = useRoutes();

  useEffect(() => {
    // Carrega automaticamente ao montar
  }, []);

  return (
    <View>
      {loading && <ActivityIndicator />}
      {error && <Text>{error}</Text>}
      {routes.map(route => (
        <Text key={route.id}>{route.route_name}</Text>
      ))}
    </View>
  );
}
```

### useDrivers

```typescript
import { useDrivers } from './hooks';

function DriverComponent() {
  const { 
    drivers, 
    loading, 
    error, 
    updateDriverLocation 
  } = useDrivers();

  const trackLocation = async (driverId: number, lat: number, long: number) => {
    await updateDriverLocation(driverId, { lat, long });
  };

  return (
    // JSX
  );
}
```

## 🎨 Componentes Integrados

### TransportDashboardAPI

Dashboard principal que exibe todas as rotas e seus estados.

```typescript
import { TransportDashboardAPI } from './components/TransportDashboardAPI';

<TransportDashboardAPI 
  studentName="João Silva"
  onRouteSelect={(route) => console.log(route)}
/>
```

**Características:**
- Carrega rotas automaticamente da API
- Exibe status de cada rota (ativa/parada)
- Pull-to-refresh para atualizar dados
- Tratamento de erros com retry

### DriverProfileAPI

Perfil completo do motorista com rastreamento GPS.

```typescript
import { DriverProfileAPI } from './components/DriverProfileAPI';

<DriverProfileAPI 
  driverId={1}
  onBack={() => navigation.goBack()}
/>
```

**Características:**
- Carrega dados do motorista da API
- Rastreamento GPS em tempo real
- Atualização automática de localização
- Exibe rota atual e mensagens

### StudentProfileAPI

Perfil do estudante/cadete.

```typescript
import { StudentProfileAPI } from './components/StudentProfileAPI';

<StudentProfileAPI 
  cadeteId={1}
  onBack={() => navigation.goBack()}
  onLogout={() => handleLogout()}
/>
```

**Características:**
- Informações pessoais do cadete
- Paragem atribuída
- Configurações de notificações
- Mensagens recebidas

### RouteDetailAPI

Detalhes completos de uma rota com mapa.

```typescript
import { RouteDetailAPI } from './components/RouteDetailAPI';

<RouteDetailAPI 
  routeId={1}
  onBack={() => navigation.goBack()}
/>
```

**Características:**
- Mapa interativo com todas as paragens
- Lista de motoristas ativos
- Informações detalhadas de cada paragem
- Visualização da rota no mapa

## 📖 Uso

### Exemplo Completo

```typescript
import React from 'react';
import { View } from 'react-native';
import { TransportDashboardAPI } from './components/TransportDashboardAPI';
import { RouteDetailAPI } from './components/RouteDetailAPI';

export default function App() {
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);

  if (selectedRoute) {
    return (
      <RouteDetailAPI 
        routeId={selectedRoute}
        onBack={() => setSelectedRoute(null)}
      />
    );
  }

  return (
    <TransportDashboardAPI 
      studentName="Estudante"
      onRouteSelect={(route) => setSelectedRoute(route.id)}
    />
  );
}
```

### Tratamento de Erros

Todos os serviços e hooks incluem tratamento de erros:

```typescript
const { routes, loading, error, fetchRoutes } = useRoutes();

if (error) {
  return (
    <View>
      <Text>Erro: {error}</Text>
      <Button title="Tentar Novamente" onPress={fetchRoutes} />
    </View>
  );
}
```

### Loading States

```typescript
if (loading) {
  return <ActivityIndicator size="large" color="#00babc" />;
}
```

## 🔐 Autenticação

Para implementar autenticação OAuth com 42:

```typescript
import { authService } from './services';

// Iniciar login
const loginUrl = await authService.login42();

// Processar callback
const user = await authService.callback42(params);
```

## 🚀 Próximos Passos

1. **Implementar WebSockets** para atualizações em tempo real
2. **Adicionar cache offline** com AsyncStorage
3. **Implementar sistema de notificações push**
4. **Adicionar testes unitários** para serviços e hooks
5. **Implementar autenticação completa** com tokens JWT

## 📝 Notas

- Todos os componentes usam TailwindCSS (NativeWind) para estilização
- As cores principais são `#00babc` (cyan) e `#0f172a` (slate-900)
- A API usa HTTP/HTTPS - considere implementar retry logic para conexões instáveis
- Coordenadas de Luanda: `-8.8383, 13.2344`

## 🐛 Problemas Comuns

### Erro de Conexão

Se a API não responder:
- Verifique a URL no arquivo `.env`
- Teste a API com Postman/Insomnia
- Verifique a conexão à internet

### Tipos TypeScript

Se houver erros de tipo:
- Execute `npm run lint`
- Verifique se todos os tipos em `types/api.ts` correspondem ao schema da API

### Localização não funciona

- Verifique permissões no `app.json`
- Teste em dispositivo físico (não funciona bem em emulador)
- Verifique se o GPS está ativado

---

Desenvolvido para **42 Luanda** 🇦🇴
