import api from './api';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { API_BASE_URL } from '@env';
import { jwtDecode } from 'jwt-decode';

interface loginIntraResponse {
  type: 'success' | 'cancel' | 'dismiss' ;
  url?: string;
  token?: string;
}

export const authService = {
  // GET /api/auth/42/login - Iniciar login OAuth 42
  login42: async (): Promise<any> => {

    const redirectUri = makeRedirectUri({
      scheme: 'exp',
      path: '/auth/42/callback'
    });
    const result = await WebBrowser.openAuthSessionAsync(
      `${API_BASE_URL}/api/auth/42/login?redirect=${redirectUri}`,
      redirectUri
    ).then((response) => {
      response  as loginIntraResponse;
      if (response.type === 'success') {
        console.log('Login bem-sucedido, redirecionado de volta ao aplicativo');
        const decodedToken: any = jwtDecode(response?.token);
        console.log('Token decodificado:', decodedToken);
      } else if (response.type === 'cancel') {
        console.log('Login cancelado pelo usuário');
      } else {
        console.log('Tipo de resultado desconhecido:', response.type);
      }
    });
    return result;
  },
  

  // GET /api/auth/42/callback - Callback OAuth 42
  // callback42: async (params: any): Promise<any> => {
  //   const response = await api.get('/auth/42/callback', { params });
  //   return response.data;
  // },
};
