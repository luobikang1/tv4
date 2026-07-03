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
}

const PROXY_URL = '/api/proxy';

export const fetchVodList = async (apiUrl: string, page = 1, categoryId?: number, keyword?: string) => {
  try {
    // Try ac=videolist first as it provides more details (posters, etc.)
    const params: any = { ac: 'videolist', pg: page };
    if (categoryId) params.t = categoryId;
    if (keyword) params.wd = keyword;

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}${queryString}`;

    let response = await axios.get(PROXY_URL, {
      params: { url: fullUrl },
      timeout: 10000
    });

    let data = response.data;
    let list = data.list || data.data || data.vods || [];

    // If searching and no results with ac=videolist, try ac=list (some CMS only support this for search)
    if (keyword && list.length === 0) {
      const listParams = { ac: 'list', pg: page, wd: keyword };
      const listQueryString = new URLSearchParams(listParams).toString();
      const listUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}${listQueryString}`;

      const listResponse = await axios.get(PROXY_URL, { params: { url: listUrl }, timeout: 8000 });
      const listData = listResponse.data;
      const briefList = listData.list || listData.data || [];

      if (briefList.length > 0) {
        // If we found results with ac=list, we might want to get their details with ac=videolist&ids=...
        const ids = briefList.map((item: any) => item.vod_id || item.id).join(',');
        const detailParams = { ac: 'videolist', ids };
        const detailUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}${new URLSearchParams(detailParams).toString()}`;

        try {
          const detailResponse = await axios.get(PROXY_URL, { params: { url: detailUrl }, timeout: 8000 });
          list = detailResponse.data.list || detailResponse.data.data || briefList;
        } catch {
          list = briefList;
        }
      }
    }

    return {
      list: list.map((item: any) => ({
        id: String(item.vod_id || item.id || ''),
        name: item.vod_name || item.name || '未知名称',
        type: item.type_name || item.type || item.class || '未知',
        pic: item.vod_pic || item.pic || '',
        lang: item.vod_lang || '',
        area: item.vod_area || '',
        year: item.vod_year || '',
        remarks: item.vod_remarks || item.remarks || '',
        actor: item.vod_actor || '',
        director: item.vod_director || '',
        content: item.vod_content || '',
        playUrl: item.vod_play_url || item.play_url || '',
      })),
      total: data.total || 0,
      page: data.page || 1,
      pagecount: data.pagecount || 1,
      limit: data.limit || 20,
      class: data.class || [],
    };
  } catch (error) {
    console.error('Fetch VOD list error:', error);
    throw error;
  }
};
