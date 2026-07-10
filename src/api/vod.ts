import axios from 'axios';

export interface VodInfo {
  id: string;
  name: string;
  type: string;
  pic: string;
  lang: string;
  area: string;
  year: string;
  remarks: string;
  actor: string;
  director: string;
  content: string;
  playUrl: string;
  sourceName?: string;
}

const PROXY_URL = '/api/proxy';

export const fetchVodList = async (apiUrl: string, page = 1, categoryId?: number, keyword?: string, sourceName?: string) => {
  try {
    const params: any = { ac: 'videolist', pg: page };
    if (categoryId) params.t = categoryId;
    if (keyword) params.wd = keyword;

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}${queryString}`;

    let response = await axios.get(PROXY_URL, { params: { url: fullUrl }, timeout: 12000 });
    let data = response.data;
    let list = data.list || data.data || data.vods || [];

    if (keyword && list.length === 0) {
      const listUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}${new URLSearchParams({ ac: 'list', pg: String(page), wd: keyword }).toString()}`;
      const listResponse = await axios.get(PROXY_URL, { params: { url: listUrl }, timeout: 8000 });
      const briefList = listResponse.data.list || listResponse.data.data || [];
      if (briefList.length > 0) {
        const ids = briefList.slice(0, 10).map((item: any) => item.vod_id || item.id).join(',');
        const detailUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}${new URLSearchParams({ ac: 'videolist', ids }).toString()}`;
        try {
          const dr = await axios.get(PROXY_URL, { params: { url: detailUrl }, timeout: 8000 });
          list = dr.data.list || dr.data.data || briefList;
        } catch { list = briefList; }
      }
    }

    return {
      list: list.map((item: any) => ({
        id: String(item.vod_id || item.id || Math.random()),
        name: (item.vod_name || item.name || '').trim(),
        type: item.type_name || item.type || '影视',
        pic: item.vod_pic || item.pic || '',
        remarks: item.vod_remarks || item.remarks || '',
        playUrl: item.vod_play_url || item.play_url || '',
        sourceName: sourceName
      })).filter((v: any) => v.name),
      total: data.total || 0,
      page: data.page || 1,
      class: data.class || [],
    };
  } catch (error) {
    console.error('API Error:', apiUrl, error);
    return { list: [], total: 0, page: 1, class: [] };
  }
};
