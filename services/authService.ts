import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { API_BASE_URL } from '@env';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Cadete, Driver } from 'types/api';

interface loginIntraResponse {
  type: 'success' | 'cancel' | 'dismiss';
  url?: string;
  token?: string;
}

interface CadeteTokenPayload {
  id: number;
  email?: string | null;
  username?: string | null;
  full_name?: string | null;
  city?: string | null;
  distrit?: string | null;
  phone?: number | string | null;
  stop?: Cadete['stop'] | null;
  avatar?: {
    link?: string | null;
  } | null;
  course?: string | null;
  level?: number | null;
  grade?: string | null;
  isDBUser?: boolean | null;
}

interface DriverTokenPayload {
  id: number;
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: number | string | null;
  photo?: string | null;
  role?: string | null;
}

export const authService = {
  // POST /api/42/driver/login - Login do motorista com username + password
  driverLogin: async (credentials: { username: string; password: string }): Promise<Driver> => {
    try {
      // Some environments return only { token } — handle both shapes
      const response = await axios.post<any>(
        `${API_BASE_URL}/api/auth/42/driver/login`,
        credentials,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Resposta do login do motorista:', response.data);

      const real_content = jwtDecode(response.data.token); // Verifica se o token é decodificável

      console.log('Conteúdo decodificado do token:', real_content);
      const token: string | undefined = response.data?.token ?? response.data;
      let driver: Driver | undefined = response.data?.driver;

      if (!token && !driver) {
        throw new Error('Resposta de login inválida do servidor');
      }

      if (!driver && token) {
        const payload = jwtDecode<DriverTokenPayload>(token);

        driver = {
          id: payload.id,
          full_name: payload.full_name ?? payload.username ?? null,
          username: payload.username ?? payload.full_name ?? null,
          email: payload.email ?? null,
          photo: payload.photo ?? null,
          phone: typeof payload.phone === 'string' ? Number(payload.phone) : payload.phone ?? null,
          coordinates: [],
          current_route: null,
        } as Driver;
      }

      // Persist token and driver info
      await AsyncStorage.multiSet([
        ['driver_user', JSON.stringify(driver)],
        ['authenticated', 'true'],
        ['token', token ?? ''],
        ['user_role', 'driver'],
      ]);

      return driver!;
    } catch (err: any) {
      console.error('Erro no driverLogin:', err?.response?.data ?? err.message ?? err);
      throw err;
    }
  },

  // GET /api/auth/42/login - Iniciar login OAuth 42
  login42: async (): Promise<loginIntraResponse> => {

    const redirectUri = makeRedirectUri({
      // scheme: 'exp',
      path: '/auth/42/callback'
    });
    const response = (await WebBrowser.openAuthSessionAsync(
      `${API_BASE_URL}/api/auth/42/login?redirect=${redirectUri}`,
      redirectUri
    )) as loginIntraResponse;

    if (response.type === 'success') {
      console.log('Login bem-sucedido, redirecionado de volta ao aplicativo');
      const data = new URL(response.url!);
      const token = data.searchParams.get('token');

      if (token) {
        const tokenDecoded = jwtDecode<CadeteTokenPayload>(token);
        const normalizedPhone =
          typeof tokenDecoded.phone === 'string'
            ? Number(tokenDecoded.phone)
            : tokenDecoded.phone;

        const cadeteUser: Cadete = {
          id: tokenDecoded.id,
          full_name: tokenDecoded.full_name ?? tokenDecoded.username ?? null,
          username: tokenDecoded.username ?? tokenDecoded.full_name ?? null,
          email: tokenDecoded.email ?? null,
          city: tokenDecoded.city ?? null,
          distrit: tokenDecoded.distrit ?? null,
          phone: Number.isFinite(normalizedPhone) ? normalizedPhone! : null,
          stop: tokenDecoded.stop ?? null,
          avatar: { link: tokenDecoded.avatar?.link ?? '' },
          course: tokenDecoded.course ?? '',
          level: tokenDecoded.level ?? 0,
          grade: tokenDecoded.grade ?? '',
          isDBUser: tokenDecoded.isDBUser ?? false,
        };

        await AsyncStorage.multiSet([
          ['user', JSON.stringify(cadeteUser)],
          ['authenticated', 'true'],
          ['token', token],
        ]);
      }
    } else if (response.type === 'cancel') {
      console.log('Login cancelado pelo usuário');
    } else {
      console.log('Tipo de resultado desconhecido:', response.type);
    }

    return response;
  },
};