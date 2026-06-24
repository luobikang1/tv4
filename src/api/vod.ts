import axios from 'axios';
export interface VodInfo { id: string; name: string; type: string; pic: string; lang: string; area: string; year: string; remarks: string; actor: string; director: string; content: string; playUrl: string; }
const PROXY_URL = '/api/proxy';
export const fetchVodList = async (apiUrl: string, page = 1, categoryId?: number, keyword?: string) => {
  try {
    const params: any = { ac: 'videolist', pg: page };
    if (categoryId) params.t = categoryId;
    if (keyword) params.wd = keyword;
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}${queryString}`;
    const response = await axios.get(PROXY_URL, { params: { url: fullUrl } });
    const data = response.data;
    return {
      list: (data.list || []).map((item: any) => ({
        id: item.vod_id, name: item.vod_name, type: item.type_name, pic: item.vod_pic, lang: item.vod_lang, area: item.vod_area, year: item.vod_year, remarks: item.vod_remarks, actor: item.vod_actor, director: item.vod_director, content: item.vod_content, playUrl: item.vod_play_url,
      })),
      total: data.total, page: data.page, pagecount: data.pagecount, limit: data.limit, class: data.class || [],
    };
  } catch (error) { console.error('Fetch VOD list error:', error); throw error; }
};
