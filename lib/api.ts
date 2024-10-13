import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getLists = () => api.get('/lists');
export const createList = (name: string) => api.post('/lists', { name });
export const deleteList = (id: string) => api.delete(`/lists/${id}`);

export const addItem = (listId: string, item: any) => api.post('/items', { ...item, shoppingListId: listId });
export const updateItem = (id: string, data: any) => api.put(`/items/${id}`, data);
export const deleteItem = (id: string) => api.delete(`/items/${id}`);

export default api;