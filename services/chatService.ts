import api from './api';
import { Chat, Message } from '../types/api';

export const chatService = {
  /** GET /api/chats/general/messages */
  getGeneralMessages: async (): Promise<Message[]> => {
    const response = await api.get('/chats/general/messages');
    return response.data;
  },

  /** GET /api/chats/route/messages/:routeId */
  getRouteMessages: async (routeId: number): Promise<Message[]> => {
    const response = await api.get(`/chats/route/messages/${routeId}`);
    return response.data;
  },
};
