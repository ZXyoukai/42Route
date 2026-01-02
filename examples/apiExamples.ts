import { adminService, cadeteService, driverService, routeService, miniBusStopService } from '../services';

/**
 * Exemplos de uso dos serviços da API
 * Execute estas funções para testar a integração
 */

// ======================
// EXEMPLOS - ADMINS
// ======================

export const testAdmins = async () => {
  console.log('=== TESTANDO ADMINS ===');
  
  try {
    // Listar todos
    const admins = await adminService.getAll();
    console.log('Admins:', admins);

    // Criar novo
    const newAdmin = await adminService.create({
      name: 'João Silva',
      email: 'joao@42luanda.ao',
      phone: '+244923456789'
    });
    console.log('Admin criado:', newAdmin);

    // Buscar por ID
    if (newAdmin.id) {
      const admin = await adminService.getById(newAdmin.id);
      console.log('Admin encontrado:', admin);

      // Atualizar
      const updated = await adminService.update(newAdmin.id, {
        name: 'João Silva Updated'
      });
      console.log('Admin atualizado:', updated);

      // Deletar
      await adminService.delete(newAdmin.id);
      console.log('Admin deletado');
    }
  } catch (error) {
    console.error('Erro testando admins:', error);
  }
};

// ======================
// EXEMPLOS - CADETES
// ======================

export const testCadetes = async () => {
  console.log('=== TESTANDO CADETES ===');
  
  try {
    // Listar todos
    const cadetes = await cadeteService.getAll();
    console.log('Cadetes:', cadetes);

    // Criar novo
    const newCadete = await cadeteService.create({
      name: 'Maria Santos',
      email: 'maria@42luanda.ao',
      phone: '+244923456788'
    });
    console.log('Cadete criado:', newCadete);

    // Obter informações da rota
    if (newCadete.id) {
      try {
        const routeInfo = await cadeteService.getRouteInformations(newCadete.id);
        console.log('Informações da rota:', routeInfo);
      } catch (err) {
        console.log('Cadete ainda não tem rota atribuída');
      }
    }
  } catch (error) {
    console.error('Erro testando cadetes:', error);
  }
};

// ======================
// EXEMPLOS - DRIVERS
// ======================

export const testDrivers = async () => {
  console.log('=== TESTANDO DRIVERS ===');
  
  try {
    // Listar todos
    const drivers = await driverService.getAll();
    console.log('Drivers:', drivers);

    // Criar novo
    const newDriver = await driverService.create({
      name: 'Carlos Mendes',
      email: 'carlos@42luanda.ao',
      phone: '+244923456787'
    });
    console.log('Driver criado:', newDriver);

    if (newDriver.id) {
      // Atualizar localização
      await driverService.updateLocation(newDriver.id, {
        lat: -8.8383,
        long: 13.2344
      });
      console.log('Localização atualizada');

      // Atribuir rota (assumindo que existe rota com ID 1)
      try {
        await driverService.assignRoute(newDriver.id, {
          route_id: 1
        });
        console.log('Rota atribuída');

        // Remover da rota
        await driverService.leaveRoute(newDriver.id);
        console.log('Removido da rota');
      } catch (err) {
        console.log('Erro ao gerenciar rota - talvez não exista rota com ID 1');
      }
    }
  } catch (error) {
    console.error('Erro testando drivers:', error);
  }
};

// ======================
// EXEMPLOS - ROTAS
// ======================

export const testRoutes = async () => {
  console.log('=== TESTANDO ROTAS ===');
  
  try {
    // Listar todas
    const routes = await routeService.getAll();
    console.log('Rotas:', routes);

    // Criar nova rota
    const newRoute = await routeService.create({
      route_name: 'Rota Central',
      description: 'Rota principal do campus 42 Luanda'
    });
    console.log('Rota criada:', newRoute);

    if (newRoute.id) {
      // Buscar rota específica
      const route = await routeService.getById(newRoute.id);
      console.log('Rota encontrada:', route);

      // Adicionar paragem
      try {
        await routeService.addStop(newRoute.id, {
          stop_name: 'Campus 42 Luanda',
          distrit: 'Talatona',
          latitude: -8.8383,
          longitude: 13.2344
        });
        console.log('Paragem adicionada à rota');
      } catch (err) {
        console.error('Erro ao adicionar paragem:', err);
      }
    }
  } catch (error) {
    console.error('Erro testando rotas:', error);
  }
};

// ======================
// EXEMPLOS - PARAGENS
// ======================

export const testMiniBusStops = async () => {
  console.log('=== TESTANDO PARAGENS ===');
  
  try {
    // Listar todas
    const stops = await miniBusStopService.getAll();
    console.log('Paragens:', stops);

    // Criar nova paragem
    const newStop = await miniBusStopService.create({
      stop_name: 'Estação Maianga',
      distrit: 'Maianga',
      latitude: -8.8383,
      longitude: 13.2344
    });
    console.log('Paragem criada:', newStop);

    if (newStop.id) {
      // Buscar paragem específica
      const stop = await miniBusStopService.getById(newStop.id);
      console.log('Paragem encontrada:', stop);

      // Atualizar paragem
      const updated = await miniBusStopService.update(newStop.id, {
        stop_name: 'Estação Maianga - Atualizada'
      });
      console.log('Paragem atualizada:', updated);

      // Deletar paragem
      await miniBusStopService.delete(newStop.id);
      console.log('Paragem deletada');
    }
  } catch (error) {
    console.error('Erro testando paragens:', error);
  }
};

// ======================
// TESTE COMPLETO
// ======================

export const runAllTests = async () => {
  console.log('🚀 INICIANDO TESTES DA API');
  console.log('API URL:', process.env.API_BASE_URL);
  console.log('');

  await testAdmins();
  console.log('');
  
  await testCadetes();
  console.log('');
  
  await testDrivers();
  console.log('');
  
  await testRoutes();
  console.log('');
  
  await testMiniBusStops();
  console.log('');

  console.log('✅ TESTES CONCLUÍDOS');
};

// ======================
// EXEMPLO DE USO EM COMPONENTE
// ======================

export const ComponentExample = () => {
  /**
   * Exemplo de como usar em um componente React Native
   * 
   * import { useRoutes } from './hooks';
   * 
   * function MyComponent() {
   *   const { routes, loading, error, fetchRoutes } = useRoutes();
   * 
   *   useEffect(() => {
   *     // Carrega automaticamente
   *   }, []);
   * 
   *   if (loading) return <ActivityIndicator />;
   *   if (error) return <Text>Erro: {error}</Text>;
   * 
   *   return (
   *     <View>
   *       {routes.map(route => (
   *         <Text key={route.id}>{route.route_name}</Text>
   *       ))}
   *     </View>
   *   );
   * }
   */
};

// Executar testes (descomente para testar)
// runAllTests();
