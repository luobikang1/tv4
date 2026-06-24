import axios from 'axios';
export const syncToCloud = async (userId: string, type: string, content: any) => {
  try { const response = await axios.post('/api/sync', { userId, type, content }); return response.data; }
  catch (error) { console.error('Sync to cloud error:', error); throw error; }
};
export const fetchFromCloud = async (userId: string, type: string) => {
  try { const response = await axios.get('/api/sync', { params: { userId, type } }); return response.data.content ? JSON.parse(response.data.content) : null; }
  catch (error) { console.error('Fetch from cloud error:', error); throw error; }
};
