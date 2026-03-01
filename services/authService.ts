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

interface payload {
  id: number;
  email: string;
  username: string;
  iat: number;
  exp: number;
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
        const tokenDecoded = jwtDecode<payload>(token);
        await AsyncStorage.setItem('user', JSON.stringify({ id: tokenDecoded.id, email: tokenDecoded.email, username: tokenDecoded.username } as Cadete));
        await AsyncStorage.setItem('authenticated', 'true');
      }
    } else if (response.type === 'cancel') {
      console.log('Login cancelado pelo usuário');
    } else {
      console.log('Tipo de resultado desconhecido:', response.type);
    }

    return response;
  },
};
