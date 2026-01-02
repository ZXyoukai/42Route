# 🚌 42Route - Sistema de Transporte 42 Luanda

<div align="center">

![42 Luanda](https://img.shields.io/badge/42-Luanda-00babc?style=for-the-badge)
![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)

**Sistema de gestão e rastreamento de transporte estudantil para 42 Luanda**

[Documentação](#-documentação) • [Instalação](#-instalação) • [API](#-api) • [Contribuir](#-contribuir)

</div>

---

## 📋 Sobre o Projeto

O **42Route** é uma aplicação mobile desenvolvida com React Native e Expo para gerenciar o sistema de transporte estudantil da 42 Luanda. O sistema permite:

- 🚍 **Rastreamento em tempo real** dos autocarros
- 📍 **Localização GPS** de motoristas e estudantes
- 🗺️ **Mapas interativos** com rotas e paragens
- 💬 **Comunicação** entre motoristas e cadetes
- 📊 **Dashboard** de gestão de rotas e transportes
- 👥 **Perfis diferenciados** para cadetes, motoristas e administradores

## ✨ Funcionalidades

### Para Cadetes (Estudantes)
- Ver rotas disponíveis e seus status
- Localizar autocarro em tempo real
- Receber notificações de chegada
- Visualizar paragem atribuída
- Trocar mensagens com motoristas

### Para Motoristas
- Rastreamento GPS automático
- Ver rota atribuída e paragens
- Atualização de status em tempo real
- Comunicação com cadetes
- Estatísticas de viagens

### Para Administradores
- Gestão completa de rotas
- Atribuição de motoristas
- Cadastro de paragens
- Monitoramento do sistema
- Relatórios e estatísticas

## 🚀 Instalação

### Pré-requisitos

- Node.js 20.18.x ou superior
- npm ou yarn
- Expo CLI
- Android Studio (para Android) ou Xcode (para iOS)

### Passos

```bash
# Clone o repositório
git clone https://github.com/ZXyoukai/42Route.git
cd 42Route

# Instale as dependências
npm install

# Configure o arquivo .env
echo "API_BASE_URL=https://four2routeapi.onrender.com/api" > .env

# Execute o projeto
npm start

# Ou execute diretamente em um dispositivo
npm run android  # Para Android
npm run ios      # Para iOS
```

## 🛠️ Tecnologias Utilizadas

### Core
- **React Native** 0.81.5
- **Expo** SDK 54
- **TypeScript** 5.9.2
- **NativeWind** (TailwindCSS para React Native)

### Navegação e UI
- React Navigation (preparado)
- Expo Vector Icons
- Custom Components

### Mapas e Localização
- React Native Maps
- Expo Maps
- Expo Location
- Google Maps API

### API e Dados
- Axios
- Custom Hooks
- TypeScript Types

### Desenvolvimento
- ESLint
- Prettier
- TypeScript Compiler

## 📁 Estrutura do Projeto

```
42Route/
├── components/          # Componentes React Native
│   ├── TransportDashboardAPI.tsx
│   ├── DriverProfileAPI.tsx
│   ├── StudentProfileAPI.tsx
│   ├── RouteDetailAPI.tsx
│   └── ...
├── services/           # Serviços da API
│   ├── api.ts
│   ├── adminService.ts
│   ├── cadeteService.ts
│   ├── driverService.ts
│   ├── routeService.ts
│   └── ...
├── hooks/              # Custom React Hooks
│   ├── useRoutes.ts
│   ├── useDrivers.ts
│   ├── useCadetes.ts
│   └── ...
├── types/              # TypeScript Types
│   └── api.ts
├── utils/              # Utilitários
│   └── apiHelpers.ts
├── examples/           # Exemplos de uso
│   └── apiExamples.ts
├── assets/             # Imagens e recursos
└── App.tsx            # Componente principal
```

## 🔌 API

O projeto está integrado com a API Backend 42Route:

**Base URL**: `https://four2routeapi.onrender.com/api`

### Endpoints Principais

#### Autenticação
- `GET /auth/42/login` - Iniciar login OAuth 42
- `GET /auth/42/callback` - Callback OAuth

#### Rotas
- `GET /routes` - Listar todas as rotas
- `GET /route/{id}` - Detalhes de uma rota
- `POST /routes` - Criar nova rota
- `POST /routes/{id}/stops` - Adicionar paragem

#### Motoristas
- `GET /drivers` - Listar motoristas
- `PUT /driver/location/socket/{id}` - Atualizar localização
- `POST /driver/assign/route/{id}` - Atribuir rota

#### Cadetes
- `GET /cadetes` - Listar cadetes
- `GET /cadete/route/informations/{id}` - Info da rota do cadete

> 📚 Documentação completa: [API_INTEGRATION.md](./API_INTEGRATION.md)

## 📖 Documentação

- [📘 Integração da API](./API_INTEGRATION.md) - Guia completo da API
- [🚀 Início Rápido](./QUICK_START.md) - Como começar rapidamente
- [✅ Checklist](./CHECKLIST.md) - Verificação pré-deployment
- [📊 Resumo da Integração](./INTEGRATION_SUMMARY.md) - Resumo técnico
- [💻 Exemplos de Código](./examples/apiExamples.ts) - Exemplos práticos

## 🎨 Design

### Cores Principais
- **Primary**: `#00babc` (Cyan)
- **Background**: `#0f172a` (Slate 900)
- **Surface**: `#1e293b` (Slate 800)
- **Text**: `#ffffff` (White)

### Tema
- Dark Mode por padrão
- Design moderno e clean
- Inspirado em Material Design 3

## 🧪 Testes

```bash
# Verificar tipos TypeScript
npm run lint

# Executar testes (quando implementados)
npm test
```

## 📱 Capturas de Tela

> 🚧 Em breve - Adicionar screenshots da aplicação

## 🤝 Contribuir

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use TypeScript para novos arquivos
- Siga o padrão ESLint configurado
- Use NativeWind para estilização
- Documente funções complexas
- Adicione testes quando possível

## 📝 Roadmap

### v1.0 - MVP (✅ Completo)
- [x] Integração com API
- [x] Dashboard de rotas
- [x] Rastreamento GPS
- [x] Perfis de usuário
- [x] Mapas interativos

### v1.1 - Melhorias
- [ ] Autenticação OAuth 42
- [ ] Notificações Push
- [ ] Cache Offline
- [ ] Histórico de viagens
- [ ] Modo noturno/claro

### v2.0 - Recursos Avançados
- [ ] WebSockets para real-time
- [ ] Chat entre usuários
- [ ] Analytics e relatórios
- [ ] Suporte multi-idioma
- [ ] Acessibilidade aprimorada

## 🐛 Problemas Conhecidos

Consulte [Issues](https://github.com/ZXyoukai/42Route/issues) no GitHub.

## 📄 Licença

Este projeto é propriedade da **42 Luanda**.

## 👥 Equipe

- **Frontend Mobile**: React Native + Expo
- **Backend API**: Node.js + PostgreSQL
- **Cliente**: 42 Luanda 🇦🇴

## 📞 Suporte

Para suporte e dúvidas:
- 📧 Email: suporte@42luanda.ao
- 💬 GitHub Issues: [Criar issue](https://github.com/ZXyoukai/42Route/issues)

## 🙏 Agradecimentos

- 42 Network
- 42 Luanda
- Comunidade React Native
- Expo Team

---

<div align="center">

**Desenvolvido com ❤️ para 42 Luanda** 🇦🇴

![Made with React Native](https://img.shields.io/badge/Made%20with-React%20Native-61DAFB?style=flat-square&logo=react)
![Built with Expo](https://img.shields.io/badge/Built%20with-Expo-000020?style=flat-square&logo=expo)
![Powered by TypeScript](https://img.shields.io/badge/Powered%20by-TypeScript-3178C6?style=flat-square&logo=typescript)

</div>
