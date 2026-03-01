import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { API_BASE_URL } from '@env';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cadete } from 'types/api';

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

export const authService = {
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
